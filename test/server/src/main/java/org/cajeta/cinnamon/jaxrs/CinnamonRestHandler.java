/*
 * Copyright 2012 The Netty Project
 *
 * The Netty Project licenses this file to you under the Apache License,
 * version 2.0 (the "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at:
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 */
package org.cajeta.cinnamon.jaxrs;

import static org.jboss.netty.handler.codec.http.HttpHeaders.*;
import static org.jboss.netty.handler.codec.http.HttpHeaders.Names.*;
import static org.jboss.netty.handler.codec.http.HttpResponseStatus.*;
import static org.jboss.netty.handler.codec.http.HttpVersion.*;

import java.lang.annotation.Annotation;
import java.lang.reflect.Method;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

import javax.ws.rs.ApplicationPath;
import javax.ws.rs.Consumes;
import javax.ws.rs.CookieParam;
import javax.ws.rs.DELETE;
import javax.ws.rs.DefaultValue;
import javax.ws.rs.FormParam;
import javax.ws.rs.GET;
import javax.ws.rs.HEAD;
import javax.ws.rs.HeaderParam;
import javax.ws.rs.MatrixParam;
import javax.ws.rs.OPTIONS;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;

import org.cajeta.cinnamon.jaxrs.converters.Converter;
import org.jboss.netty.buffer.ChannelBuffer;
import org.jboss.netty.buffer.ChannelBuffers;
import org.jboss.netty.channel.ChannelFuture;
import org.jboss.netty.channel.ChannelFutureListener;
import org.jboss.netty.channel.ChannelHandlerContext;
import org.jboss.netty.channel.ExceptionEvent;
import org.jboss.netty.channel.MessageEvent;
import org.jboss.netty.channel.SimpleChannelUpstreamHandler;
import org.jboss.netty.handler.codec.http.Cookie;
import org.jboss.netty.handler.codec.http.CookieDecoder;
import org.jboss.netty.handler.codec.http.CookieEncoder;
import org.jboss.netty.handler.codec.http.DefaultHttpResponse;
import org.jboss.netty.handler.codec.http.HttpChunk;
import org.jboss.netty.handler.codec.http.HttpChunkTrailer;
import org.jboss.netty.handler.codec.http.HttpHeaders;
import org.jboss.netty.handler.codec.http.HttpRequest;
import org.jboss.netty.handler.codec.http.HttpResponse;
import org.jboss.netty.handler.codec.http.QueryStringDecoder;
import org.jboss.netty.util.CharsetUtil;
import org.reflections.Reflections;

/**
 * The constructor in this class utilizes a JAX-RS binding manager to associate
 * request parameters and even url sturcture with a particular method.  Since the
 * binding is done at startup, and uses reflection, simply adding a class (or method) 
 * to the build with the appropriate annotations will be sufficient (no descriptors necessary).
 * See examples for more information on design and caveats.
 * 
 * @author julian klappenbach
 */
public class CinnamonRestHandler extends SimpleChannelUpstreamHandler {

	private Map<String, PathSegment> segmentMap = new HashMap<String, PathSegment>();
	private Map<String, RestClass> typeMap = new HashMap<String, RestClass>();
	private static Map<Class<?>, Converter> paramConverters = new HashMap<Class<?>, Converter>();
	private String applicationPath = "/";
	private Reflections reflections;

	
    private HttpRequest request;
    private boolean readingChunks;
    
    /** Buffer that stores the response content */
    private final StringBuilder buf = new StringBuilder();
    
    public CinnamonRestHandler(String rootScanPackage) {
		reflections = new Reflections(rootScanPackage);
		
		try {
			// ApplicationPath search
			Set<Class<?>> classes = reflections.getTypesAnnotatedWith(ApplicationPath.class);
			if (classes.size() > 0) {
				Class<?> c = classes.iterator().next();
				applicationPath = c.getAnnotation(ApplicationPath.class).value();
			}
			
			// Path annotation search
			classes = reflections.getTypesAnnotatedWith(Path.class);	
			for (Class<?> c : classes) {
				RestClass classEntry = new RestClass(c.newInstance());
				classEntry.setPath(c.getAnnotation(Path.class).value());
				typeMap.put(c.getCanonicalName(), classEntry);
			}
			
			// Produces annotation search
			classes = reflections.getTypesAnnotatedWith(Produces.class);	
			for (Class<?> c : classes) {
				// First check to see if the entry already exists.  If not, create it
				RestClass classEntry = typeMap.get(c.getCanonicalName());
				if (classEntry == null) {
					classEntry = new RestClass(c.newInstance());
					typeMap.put(c.getCanonicalName(), classEntry);
				}
				classEntry.addProduces(c.getAnnotation(Produces.class).value());
			}
			
			// Consumes annotation search
			classes = reflections.getTypesAnnotatedWith(Consumes.class);	
			for (Class<?> c : classes) {
				// First check to see if the entry already exists.  If not, create it
				RestClass classEntry = typeMap.get(c.getCanonicalName());
				if (classEntry == null) {
					classEntry = new RestClass(c.newInstance());
					typeMap.put(c.getCanonicalName(), classEntry);
				}
				classEntry.addConsumes(c.getAnnotation(Consumes.class).value());
			}
			
			// Now scan for methods with GET, POST, PUT, DELETE, HEAD, and OPTIONS
			// For each method, we track a path that will be used as its key
			processMethodsWithAnnotation(GET.class, POST.class, PUT.class, DELETE.class, HEAD.class, OPTIONS.class);
			
			
		} catch (Exception e) {
			// Failed.  Log and notify
		}
    }
    
	@SuppressWarnings("unchecked")
	private void processMethodsWithAnnotation(Class<? extends Annotation>... annotationClasses) throws Exception {
		for (Class<? extends Annotation> annotationClass : annotationClasses) {
			Set<Method> methods = reflections.getMethodsAnnotatedWith(annotationClass);
			for (Method method : methods) {
				String pathKey = applicationPath;
				
				// Get the owning class, if it currently exists in the map.  If not,
				// create a new entry.
				Class<?> declaringClass = method.getDeclaringClass();
				RestClass classEntry = typeMap.get(declaringClass.getCanonicalName());
				if (classEntry == null) {
					classEntry = new RestClass(declaringClass.newInstance());
					typeMap.put(declaringClass.getCanonicalName(), classEntry);				
				}

				RestMethod methodEntry = new RestMethod(classEntry.getInstance(), 
						method.getName(), classEntry);
				
				pathKey = buildPath(pathKey, classEntry.getPath());
				
				Annotation[] methodAnnotations = method.getAnnotations();
				for (Annotation methodAnnotation : methodAnnotations) {
					Class<? extends Annotation> annotationType = methodAnnotation.annotationType();
					if (annotationType == Path.class) {
						pathKey = buildPath(pathKey, ((Path) methodAnnotation).value());
					} else if (annotationType == Consumes.class) {
						methodEntry.addConsumes(((Consumes) methodAnnotation).value());
					} else if (annotationType == Produces.class) {
						methodEntry.addProduces(((Produces) methodAnnotation).value());
					}
				}
				
				// Now iterate over the arguments to the methods, to see if we have any annotations 
				// there. Look for params and default values.
				Class<?>[] paramTypes = method.getParameterTypes();
				for (Class<?> paramType : paramTypes) {
					ParameterSource paramSource = null;
					String paramName = null;
					String defaultValue = null;
					Annotation[] paramAnnotations = paramType.getAnnotations();
					for (Annotation paramAnnotation : paramAnnotations) {
						Class<? extends Annotation> annotationType = paramAnnotation.annotationType();
						if (annotationType == HeaderParam.class) {
							paramSource = ParameterSource.Header;
							paramName = ((HeaderParam) paramAnnotation).value();
						} else if (annotationType == CookieParam.class) {
							paramSource = ParameterSource.Cookie;
							paramName = ((CookieParam) paramAnnotation).value();
						} else if (annotationType == MatrixParam.class) {
							paramSource = ParameterSource.Matrix;
							paramName = ((MatrixParam) paramAnnotation).value();
						} else if (annotationType == PathParam.class) {
							paramSource = ParameterSource.Path;
							paramName = ((PathParam) paramAnnotation).value();
						} else if (annotationType == QueryParam.class) {
							paramSource = ParameterSource.Query;
							paramName = ((QueryParam) paramAnnotation).value();
						} else if (annotationType == FormParam.class) {
							paramSource = ParameterSource.Form;
							paramName = ((PathParam) paramAnnotation).value();
						} else if (annotationType == HeaderParam.class) {
							paramSource = ParameterSource.Path;
							paramName = ((PathParam) paramAnnotation).value();
						} else if (annotationType == DefaultValue.class) {
							defaultValue = ((DefaultValue) paramAnnotation).value();
						}
					}
					methodEntry.addParameterEntry(new RestParameter(paramSource, 
							paramName, paramType, defaultValue));
				}
				
				// Now parse the completed pathKey to see if there are any path argument declarations.
				// Also, ensure that the declarations are at the end of the url
				String[] segments = pathKey.split("/");
				RestPathConfig pathEntry = null;
				int firstParamIndex = 0;
				for (int i = 0; i < segments.length; i++) {
					if (segments[i].contains("{")) {
						if (pathEntry == null)
							pathEntry = new RestPathConfig(); 
						// TODO More sophisticated parsing of path params, allow regex filtering						
						pathEntry.addPathParam(segments[i].substring(1, segments[i].length() - 1), new Integer(i));
					}
				}
				if (pathEntry != null) {
					methodEntry.setPathEntry(pathEntry);
				}
					
			}
			
		}
	}
	
	private String buildPath(String base, String append) {
		if (append == null || append.equals(""))
			return base;
		
		StringBuilder sb = new StringBuilder(base);
		if (!base.endsWith("/") && !append.startsWith("/"))
			sb.append("/");
		sb.append(append);
		return sb.toString();
	}
	
	@Override
	public void messageReceived(ChannelHandlerContext ctx, MessageEvent e) throws Exception {
        HttpRequest request = (HttpRequest) e.getMessage();
        String uri = request.getUri();
        
        // First, break it up into segments
        String[] urlSegments = uri.split("/");
        
        PathSegment segmentEntry = this.segmentMap.get(urlSegments[0]);
        if (segmentEntry == null) {
        	// return 404
        } else {
        	segmentEntry.dispatch(request, urlSegments, 0);
        }
        	
	}

//    @Override
//    public void messageReceived(ChannelHandlerContext ctx, MessageEvent e) throws Exception {
//        if (!readingChunks) {
//            HttpRequest request = this.request = (HttpRequest) e.getMessage();
//
//            if (is100ContinueExpected(request)) {
//                send100Continue(e);
//            }
//
//            buf.setLength(0);
//            buf.append("WELCOME TO THE WILD WILD WEB SERVER\r\n");
//            buf.append("===================================\r\n");
//
//            buf.append("VERSION: " + request.getProtocolVersion() + "\r\n");
//            buf.append("HOSTNAME: " + getHost(request, "unknown") + "\r\n");
//            buf.append("REQUEST_URI: " + request.getUri() + "\r\n\r\n");
//
//            for (Map.Entry<String, String> h: request.getHeaders()) {
//                buf.append("HEADER: " + h.getKey() + " = " + h.getValue() + "\r\n");
//            }
//            buf.append("\r\n");
//
//            QueryStringDecoder queryStringDecoder = new QueryStringDecoder(request.getUri());
//            Map<String, List<String>> params = queryStringDecoder.getParameters();
//            if (!params.isEmpty()) {
//                for (Entry<String, List<String>> p: params.entrySet()) {
//                    String key = p.getKey();
//                    List<String> vals = p.getValue();
//                    for (String val : vals) {
//                        buf.append("PARAM: " + key + " = " + val + "\r\n");
//                    }
//                }
//                buf.append("\r\n");
//            }
//
//            if (request.isChunked()) {
//                readingChunks = true;
//            } else {
//                ChannelBuffer content = request.getContent();
//                if (content.readable()) {
//                    buf.append("CONTENT: " + content.toString(CharsetUtil.UTF_8) + "\r\n");
//                }
//                writeResponse(e);
//            }
//        } else {
//            HttpChunk chunk = (HttpChunk) e.getMessage();
//            if (chunk.isLast()) {
//                readingChunks = false;
//                buf.append("END OF CONTENT\r\n");
//
//                HttpChunkTrailer trailer = (HttpChunkTrailer) chunk;
//                if (!trailer.getHeaderNames().isEmpty()) {
//                    buf.append("\r\n");
//                    for (String name: trailer.getHeaderNames()) {
//                        for (String value: trailer.getHeaders(name)) {
//                            buf.append("TRAILING HEADER: " + name + " = " + value + "\r\n");
//                        }
//                    }
//                    buf.append("\r\n");
//                }
//
//                writeResponse(e);
//            } else {
//                buf.append("CHUNK: " + chunk.getContent().toString(CharsetUtil.UTF_8) + "\r\n");
//            }
//        }
//    }

    private void writeResponse(MessageEvent e) {
        // Decide whether to close the connection or not.
        boolean keepAlive = isKeepAlive(request);

        // Build the response object.
        HttpResponse response = new DefaultHttpResponse(HTTP_1_1, OK);
        response.setContent(ChannelBuffers.copiedBuffer(buf.toString(), CharsetUtil.UTF_8));
        response.setHeader(CONTENT_TYPE, "text/plain; charset=UTF-8");

        if (keepAlive) {
            // Add 'Content-Length' header only for a keep-alive connection.
            response.setHeader(CONTENT_LENGTH, response.getContent().readableBytes());
            // Add keep alive header as per:
            // - http://www.w3.org/Protocols/HTTP/1.1/draft-ietf-http-v11-spec-01.html#Connection
            response.setHeader(CONNECTION, HttpHeaders.Values.KEEP_ALIVE);
        }

        // Encode the cookie.
        String cookieString = request.getHeader(COOKIE);
        if (cookieString != null) {
            CookieDecoder cookieDecoder = new CookieDecoder();
            Set<Cookie> cookies = cookieDecoder.decode(cookieString);
            if (!cookies.isEmpty()) {
                // Reset the cookies if necessary.
                CookieEncoder cookieEncoder = new CookieEncoder(true);
                for (Cookie cookie : cookies) {
                    cookieEncoder.addCookie(cookie);
                    response.addHeader(SET_COOKIE, cookieEncoder.encode());
                }
            }
        } else {
            // Browser sent no cookie.  Add some.
            CookieEncoder cookieEncoder = new CookieEncoder(true);
            cookieEncoder.addCookie("key1", "value1");
            response.addHeader(SET_COOKIE, cookieEncoder.encode());
            cookieEncoder.addCookie("key2", "value2");
            response.addHeader(SET_COOKIE, cookieEncoder.encode());
        }

        // Write the response.
        ChannelFuture future = e.getChannel().write(response);

        // Close the non-keep-alive connection after the write operation is done.
        if (!keepAlive) {
            future.addListener(ChannelFutureListener.CLOSE);
        }
    }

    private static void send100Continue(MessageEvent e) {
        HttpResponse response = new DefaultHttpResponse(HTTP_1_1, CONTINUE);
        e.getChannel().write(response);
    }

    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, ExceptionEvent e)
            throws Exception {
        e.getCause().printStackTrace();
        e.getChannel().close();
    }

    public static void addConverter(Class<?> c, Converter converter) {
		paramConverters.put(c, converter);
	}
	
	static Map<Class<?>, Converter> getParamConverters() { return paramConverters; }

}
