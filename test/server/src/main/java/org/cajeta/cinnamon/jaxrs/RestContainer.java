/**
 * 
 */
package org.cajeta.cinnamon.jaxrs;

import static org.jboss.netty.handler.codec.http.HttpHeaders.isKeepAlive;
import static org.jboss.netty.handler.codec.http.HttpHeaders.Names.CONNECTION;
import static org.jboss.netty.handler.codec.http.HttpHeaders.Names.CONTENT_LENGTH;
import static org.jboss.netty.handler.codec.http.HttpHeaders.Names.CONTENT_TYPE;
import static org.jboss.netty.handler.codec.http.HttpHeaders.Names.COOKIE;
import static org.jboss.netty.handler.codec.http.HttpHeaders.Names.SET_COOKIE;

import java.io.IOException;
import java.lang.annotation.Annotation;
import java.net.URLEncoder;
import java.nio.ByteBuffer;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

import javax.xml.bind.JAXBContext;
import javax.xml.bind.JAXBException;

import org.cajeta.cinnamon.CinnamonUtil;
import org.cajeta.cinnamon.jaxrs.annotation.ApplicationRootPath;
import org.cajeta.cinnamon.jaxrs.annotation.Consumes;
import org.cajeta.cinnamon.jaxrs.annotation.Delete;
import org.cajeta.cinnamon.jaxrs.annotation.Get;
import org.cajeta.cinnamon.jaxrs.annotation.Head;
import org.cajeta.cinnamon.jaxrs.annotation.Options;
import org.cajeta.cinnamon.jaxrs.annotation.Path;
import org.cajeta.cinnamon.jaxrs.annotation.Post;
import org.cajeta.cinnamon.jaxrs.annotation.Put;
import org.cajeta.cinnamon.jaxrs.codec.BooleanConverter;
import org.cajeta.cinnamon.jaxrs.codec.Converter;
import org.cajeta.cinnamon.jaxrs.codec.IntegerConverter;
import org.cajeta.cinnamon.jaxrs.codec.LongConverter;
import org.cajeta.cinnamon.jaxrs.codec.OutputStreamMonitor;
import org.cajeta.cinnamon.jaxrs.message.CinnamonResponse;
import org.cajeta.cinnamon.jaxrs.message.RequestContext;
import org.codehaus.jackson.JsonFactory;
import org.codehaus.jackson.JsonGenerator;
import org.codehaus.jackson.map.ObjectMapper;
import org.jboss.netty.buffer.ByteBufferBackedChannelBuffer;
import org.jboss.netty.buffer.ChannelBuffer;
import org.jboss.netty.buffer.ChannelBufferOutputStream;
import org.jboss.netty.buffer.ChannelBuffers;
import org.jboss.netty.buffer.DynamicChannelBuffer;
import org.jboss.netty.buffer.HeapChannelBuffer;
import org.jboss.netty.channel.ChannelFuture;
import org.jboss.netty.channel.ChannelFutureListener;
import org.jboss.netty.handler.codec.http.Cookie;
import org.jboss.netty.handler.codec.http.CookieDecoder;
import org.jboss.netty.handler.codec.http.CookieEncoder;
import org.jboss.netty.handler.codec.http.HttpHeaders;
import org.jboss.netty.handler.codec.http.HttpMethod;
import org.jboss.netty.handler.codec.http.HttpRequest;
import org.jboss.netty.handler.codec.http.HttpResponseStatus;
import org.jboss.netty.util.CharsetUtil;
import org.reflections.Reflections;
import org.reflections.scanners.FieldAnnotationsScanner;
import org.reflections.scanners.MethodAnnotationsScanner;
import org.reflections.scanners.SubTypesScanner;
import org.reflections.scanners.TypeAnnotationsScanner;
import org.reflections.util.ClasspathHelper;
import org.reflections.util.ConfigurationBuilder;
import org.reflections.util.FilterBuilder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Java API for NIO based REST.
 * 
 * @author julian
 * 
 */
public class RestContainer {
	private static RestContainer theInstance = null;
	private static final Map<Class<?>, Converter> paramConverters = new HashMap<Class<?>, Converter>();
	private final static Logger logger = LoggerFactory.getLogger(RestContainer.class);
	private final Map<String, PathSegmentEntry> segmentEntries = new HashMap<String, PathSegmentEntry>();
	private final Map<Class<? extends RequestHandler>, RequestHandler> typeMap = new HashMap<Class<? extends RequestHandler>, RequestHandler>();
	private static final JsonFactory factory = new JsonFactory();
	private static final ObjectMapper mapper = new ObjectMapper();

	private String applicationPath = "/";
	private Reflections reflections;
	
	/**
	 * One time initialization that:
	 * 
	 * 1.  	First, find the classes annotated with Path, Produces and Consumes, use those to build the initial map.  
	 * 		Paths can indicate arguments "{id}", so paths need to be parsed (split) for argument declarations.
	 *
	 * 2.  	Then get methods annotated for actions (GET, PUT, POST, DELETE, HEAD, OPTION).  These
	 * 		can contain path declarations, using any type path statements as a prefix.  
	 */
	@SuppressWarnings("unchecked")
	private RestContainer(String rootScanPackage) {
		
		// Install the default converters
		RestContainer.paramConverters.put(int.class, new IntegerConverter());
		RestContainer.paramConverters.put(boolean.class, new BooleanConverter());
		RestContainer.paramConverters.put(long.class, new LongConverter());
		
		reflections = new Reflections(new ConfigurationBuilder()
        .filterInputsBy(new FilterBuilder().include(FilterBuilder.prefix(rootScanPackage)))
        .setUrls(ClasspathHelper.forPackage(rootScanPackage))
        .setScanners(new SubTypesScanner(), new TypeAnnotationsScanner(), 
				new MethodAnnotationsScanner(), new FieldAnnotationsScanner()));
		
		try {
			// ApplicationPath search
			Set<Class<?>> classes = reflections.getTypesAnnotatedWith(ApplicationRootPath.class);
			if (classes.size() > 0) {
				Class<?> c = classes.iterator().next();
				applicationPath = c.getAnnotation(ApplicationRootPath.class).value();
			}
			
			// Path annotation search
			classes = reflections.getTypesAnnotatedWith(Path.class);	
			for (Class<?> c : classes) {
				RequestHandler handlerEntry = (RequestHandler) c.newInstance();
				handlerEntry.setPath(c.getAnnotation(Path.class).value());
				typeMap.put((Class<? extends RequestHandler>) c, handlerEntry);
			}
			
			// Consumes annotation search
			classes = reflections.getTypesAnnotatedWith(Consumes.class);	
			for (Class<?> c : classes) {
				// First check to see if the entry already exists.  If not, create it
				RequestHandler handlerEntry = typeMap.get(c);
				if (handlerEntry == null) {
					handlerEntry = (RequestHandler) c.newInstance();
					typeMap.put((Class<? extends RequestHandler>) c, handlerEntry);
				}
				handlerEntry.addConsumes(c.getAnnotation(Consumes.class).value());
			}
			
			// Now scan for methods with GET, POST, PUT, DELETE, HEAD, and OPTIONS
			// For each method, we track a path that will be used as its key
			processTypesWithAnnotation(Get.class, Post.class, Put.class, Delete.class, Head.class, Options.class);
			
		} catch (Exception e) {
			logger.error(e.getMessage());
			e.printStackTrace();
		}
	}
	
	@SuppressWarnings("unchecked")
	private void processTypesWithAnnotation(Class<? extends Annotation>... annotationClasses) throws Exception {
		for (Class<? extends Annotation> annotationClass : annotationClasses) {
			Set<Class<?>> classes = reflections.getTypesAnnotatedWith(annotationClass);
			for (Class<?> c : classes) {
				String pathKey = applicationPath;
				
				// Get the owning class, if it currently exists in the map.  If not,
				// create a new entry.
				RequestHandler handlerEntry = typeMap.get(c);
				if (handlerEntry == null) {
					handlerEntry = (RequestHandler) c.newInstance();
				}
				handlerEntry.setHttpMethod(HttpMethod.valueOf(annotationClass.getSimpleName()));			
				pathKey = buildPath(pathKey, handlerEntry.getPath());
												
				// Now parse the completed pathKey to see if there are any path argument declarations.
				// Also, ensure that the declarations are at the end of the url
				String[] segments = CinnamonUtil.splitUri(pathKey);
					
				// Finally, add the segments and method to the map
				PathSegmentEntry pathSegment = this.segmentEntries.get(segments[0]);
				if (pathSegment == null) {
					pathSegment = new PathSegmentEntry(handlerEntry, segments, 1);
					this.segmentEntries.put(segments[0], pathSegment);
				} else {
					pathSegment.populate(handlerEntry, segments, 1);
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
		
	public void dispatch(RequestContext requestContext) {
		String[] uriSegments = requestContext.getUriSegments();
		PathSegmentEntry childEntry = segmentEntries.get(uriSegments[0]);
		if (childEntry != null) {
			writeResponse(requestContext, childEntry.dispatch(requestContext, 1));
		}
	}
	
	static public void writeResponse(RequestContext requestContext, CinnamonResponse response) {
		if (response == null)
			return; 
		
		HttpRequest httpRequest = requestContext.getHttpRequest();
		if (response.getEntity() != null) {
			String encoding = httpRequest.getHeader(org.jboss.netty.handler.codec.http.HttpHeaders.Names.ACCEPT);
			try {
				if (encoding.contains("json")) {
					encodeJson(response);
				} else if (encoding.contains("xml")) {
					
				} 
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}
		
		boolean keepAlive = isKeepAlive(httpRequest);

		if (keepAlive) {
			// Add 'Content-Length' header only for a keep-alive connection.
			response.setHeader(CONTENT_LENGTH, response.getContent()
					.readableBytes());
			response.setHeader(CONNECTION, HttpHeaders.Values.KEEP_ALIVE);
		}

		// Encode the cookie.
		String cookieString = httpRequest.getHeader(COOKIE);
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
		}

		String strContent = response.getContent().toString(CharsetUtil.UTF_8);
		strContent = URLEncoder.encode(strContent);
		response.setContent(ChannelBuffers.copiedBuffer(strContent, CharsetUtil.UTF_8));
		int length = strContent.length();
		strContent = response.getContent().toString(CharsetUtil.UTF_8);
		response.setHeader(CONTENT_TYPE, httpRequest.getHeader("Accept"));
		response.setHeader(CONTENT_LENGTH, response.getContent().readableBytes());
		response.setHeader(HttpHeaders.Names.CONTENT_ENCODING, "identity");
		ChannelFuture future = requestContext.getMessageEvent().getChannel().write(response);

		// Close the non-keep-alive connection after the write operation is
		// done.
		if (!keepAlive || response.getStatus() != HttpResponseStatus.CONTINUE) {
			future.addListener(ChannelFutureListener.CLOSE);
		}
	}	
	
	static void encodeJson(CinnamonResponse response) throws IOException {
		ChannelBufferOutputStream os = new ChannelBufferOutputStream(response.getContent());
		JsonGenerator generator = factory.createJsonGenerator(os);		
		mapper.writeValue(generator, response.getEntity());
	}
	
	static void encodeXmlEntity(CinnamonResponse response) throws JAXBException {
		final JAXBContext jaxbContext = JAXBContext.newInstance(response.getEntity().getClass());
		ChannelBufferOutputStream outputStream = new ChannelBufferOutputStream(response.getContent());
		OutputStreamMonitor osm = new OutputStreamMonitor(outputStream);
        jaxbContext.createMarshaller().marshal(response.getEntity(), osm);    
	}
		
	public synchronized static void initialize(String commonScanPackage) {
		if (theInstance == null) {
			theInstance = new RestContainer(commonScanPackage);
		}
	}
	
	public static RestContainer getInstance() { return theInstance; }
	
	public static void addConverter(Class<?> c, Converter converter) {
		paramConverters.put(c, converter);
	}
	
	static Map<Class<?>, Converter> getParamConverters() { return paramConverters; }
	
}
