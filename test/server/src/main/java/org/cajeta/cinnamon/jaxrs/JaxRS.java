/**
 * 
 */
package org.cajeta.cinnamon.jaxrs;

import java.lang.annotation.Annotation;
import java.lang.reflect.Method;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

import javax.ws.rs.ApplicationPath;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.DELETE;
import javax.ws.rs.OPTIONS;
import javax.ws.rs.HEAD;
import javax.ws.rs.HeaderParam;
import javax.ws.rs.CookieParam;
import javax.ws.rs.MatrixParam;
import javax.ws.rs.PathParam;
import javax.ws.rs.FormParam;
import javax.ws.rs.QueryParam;
import javax.ws.rs.DefaultValue;
import javax.ws.rs.Encoded;

import org.cajeta.cinnamon.jaxrs.converters.Converter;
import org.jboss.netty.channel.ChannelHandlerContext;
import org.jboss.netty.channel.MessageEvent;
import org.jboss.netty.handler.codec.http.HttpRequest;
import org.reflections.Reflections;

/**
 * Java API for NIO based REST.
 * 
 * @author julian
 * 
 */
public class JaxRS {
	
	private static JaxRS theInstance = null;
	private Map<String, RestDispatchEntry> dispatchMap = new HashMap<String, RestDispatchEntry>();
	private Map<String, RestClassEntry> typeMap = new HashMap<String, RestClassEntry>();
	private static Map<Class<?>, Converter> paramConverters = new HashMap<Class<?>, Converter>();
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
	private JaxRS(String commonScanPackage) {
		reflections = new Reflections(commonScanPackage);
		
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
				RestClassEntry classEntry = new RestClassEntry(c.newInstance());
				classEntry.setPath(c.getAnnotation(Path.class).value());
				typeMap.put(c.getCanonicalName(), classEntry);
			}
			
			// Produces annotation search
			classes = reflections.getTypesAnnotatedWith(Produces.class);	
			for (Class<?> c : classes) {
				// First check to see if the entry already exists.  If not, create it
				RestClassEntry classEntry = typeMap.get(c.getCanonicalName());
				if (classEntry == null) {
					classEntry = new RestClassEntry(c.newInstance());
					typeMap.put(c.getCanonicalName(), classEntry);
				}
				classEntry.addProduces(c.getAnnotation(Produces.class).value());
			}
			
			// Consumes annotation search
			classes = reflections.getTypesAnnotatedWith(Consumes.class);	
			for (Class<?> c : classes) {
				// First check to see if the entry already exists.  If not, create it
				RestClassEntry classEntry = typeMap.get(c.getCanonicalName());
				if (classEntry == null) {
					classEntry = new RestClassEntry(c.newInstance());
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
				RestClassEntry classEntry = typeMap.get(declaringClass.getCanonicalName());
				if (classEntry == null) {
					classEntry = new RestClassEntry(declaringClass.newInstance());
					typeMap.put(declaringClass.getCanonicalName(), classEntry);				
				}

				RestMethodEntry methodEntry = new RestMethodEntry(classEntry.getInstance(), 
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
					methodEntry.addParameterEntry(new RestParameterEntry(paramSource, 
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
	
	
	public void messageReceived(ChannelHandlerContext ctx, MessageEvent e) throws Exception {
        HttpRequest request = (HttpRequest) e.getMessage();
        String uri = request.getUri();
        
        // First, break it up into segments
        String[] urlSegments = uri.split("/");
        
        RestDispatchEntry dispatchEntry = this.dispatchMap.get(urlSegments[0]);
        if (dispatchEntry == null) {
        	// return 404
        } else {
        	dispatchEntry.execute(request, urlSegments, 0);
        }
        	
	}
	
	public synchronized static void initialize(String commonScanPackage) {
		if (theInstance == null) {
			theInstance = new JaxRS(commonScanPackage);
		}
	}
	
	public static JaxRS getInstance() { return theInstance; }
	
	public static void addConverter(Class<?> c, Converter converter) {
		paramConverters.put(c, converter);
	}
	
	static Map<Class<?>, Converter> getParamConverters() { return paramConverters; }
	
}
