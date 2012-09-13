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

import org.cajeta.cinnamon.jaxrs.converters.BooleanConverter;
import org.cajeta.cinnamon.jaxrs.converters.Converter;
import org.cajeta.cinnamon.jaxrs.converters.IntegerConverter;
import org.cajeta.cinnamon.jaxrs.converters.LongConverter;
import org.jboss.netty.channel.ChannelHandlerContext;
import org.jboss.netty.channel.MessageEvent;
import org.jboss.netty.handler.codec.http.HttpMethod;
import org.jboss.netty.handler.codec.http.HttpRequest;
import org.reflections.Reflections;
import org.reflections.scanners.MethodAnnotationsScanner;
import org.reflections.scanners.SubTypesScanner;
import org.reflections.scanners.TypeAnnotationsScanner;
import org.reflections.scanners.FieldAnnotationsScanner;
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
public class JaxRS {
	private final static Logger logger = LoggerFactory.getLogger(JaxRS.class);
	private static JaxRS theInstance = null;
	private Map<String, PathSegmentEntry> segmentMap = new HashMap<String, PathSegmentEntry>();
	private Map<String, RestClass> typeMap = new HashMap<String, RestClass>();
	//private Map<Class<?>, HttpMethod> httpMethods = new HashMap<Class<?>, HttpMethod>();
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
	private JaxRS(String rootScanPackage) {
		
		// Install the default converters
		JaxRS.paramConverters.put(int.class, new IntegerConverter());
		JaxRS.paramConverters.put(boolean.class, new BooleanConverter());
		JaxRS.paramConverters.put(long.class, new LongConverter());
		
		reflections = new Reflections(new ConfigurationBuilder()
        .filterInputsBy(new FilterBuilder().include(FilterBuilder.prefix(rootScanPackage)))
        .setUrls(ClasspathHelper.forPackage(rootScanPackage))
        .setScanners(new SubTypesScanner(), new TypeAnnotationsScanner(), 
				new MethodAnnotationsScanner(), new FieldAnnotationsScanner()));
		
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
			logger.error(e.getMessage());
			e.printStackTrace();
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

				RestMethod restMethod = new RestMethod(classEntry, classEntry.getInstance(), 
						method, HttpMethod.valueOf(annotationClass.getSimpleName()));
				
				pathKey = buildPath(pathKey, classEntry.getPath());
				
				Annotation[] methodAnnotations = method.getAnnotations();
				for (Annotation methodAnnotation : methodAnnotations) {
					Class<? extends Annotation> annotationType = methodAnnotation.annotationType();
					if (annotationType == Path.class) {
						pathKey = buildPath(pathKey, ((Path) methodAnnotation).value());
					} else if (annotationType == Consumes.class) {
						restMethod.addConsumes(((Consumes) methodAnnotation).value());
					} else if (annotationType == Produces.class) {
						restMethod.addProduces(((Produces) methodAnnotation).value());
					}
				}
				
				// Now iterate over the arguments to the methods, to see if we have any annotations 
				// there. Look for params and default values.
				Class<?>[] paramTypes = method.getParameterTypes();
				Annotation[][] paramAnnotations = method.getParameterAnnotations();
				for (int i = 0; i < paramTypes.length; i++) {
					ParameterSource paramSource = null;
					String paramName = null;
					String defaultValue = null;
					for (int j = 0; j < paramAnnotations[i].length; j++) {
						Class<? extends Annotation> annotationType = paramAnnotations[i][j].annotationType();
						if (annotationType == HeaderParam.class) {
							paramSource = ParameterSource.Header;
							paramName = ((HeaderParam) paramAnnotations[i][j]).value();
						} else if (annotationType == CookieParam.class) {
							paramSource = ParameterSource.Cookie;
							paramName = ((CookieParam) paramAnnotations[i][j]).value();
							restMethod.parseCookie();
						} else if (annotationType == MatrixParam.class) {
							paramSource = ParameterSource.Matrix;
							paramName = ((MatrixParam) paramAnnotations[i][j]).value();
							restMethod.parseMatrix();
						} else if (annotationType == PathParam.class) {
							paramSource = ParameterSource.Path;
							paramName = ((PathParam) paramAnnotations[i][j]).value();
							restMethod.parsePath();
						} else if (annotationType == QueryParam.class) {
							paramSource = ParameterSource.Query;
							paramName = ((QueryParam) paramAnnotations[i][j]).value();
							restMethod.parseQuery();
						} else if (annotationType == FormParam.class) {
							paramSource = ParameterSource.Form;
							paramName = ((FormParam) paramAnnotations[i][j]).value();
							restMethod.parseForm();
						} else if (annotationType == DefaultValue.class) {
							defaultValue = ((DefaultValue) paramAnnotations[i][j]).value();
						}
					}
					restMethod.addParameterEntry(new RestParameter(paramSource, 
							paramName, paramTypes[i], defaultValue));
				}
				
				// Now parse the completed pathKey to see if there are any path argument declarations.
				// Also, ensure that the declarations are at the end of the url
				String[] segments = splitUri(pathKey);
					
				RestPathConfig pathConfig = null;
				for (int i = 0; i < segments.length; i++) {
					if (segments[i].contains("{")) {
						if (pathConfig == null)
							pathConfig = new RestPathConfig(); 
						// TODO More sophisticated parsing of path params, allow regex filtering						
						pathConfig.addPathParam(segments[i].substring(1, segments[i].length() - 1), new Integer(i));
					}
				}
				if (pathConfig != null) {
					restMethod.setPathEntry(pathConfig);
				}
				
				// Finally, add the segments and method to the map
				PathSegmentEntry pathSegment = this.segmentMap.get(segments[0]);
				if (pathSegment == null) {
					pathSegment = new PathSegmentEntry(restMethod, segments, 1);
					this.segmentMap.put(segments[0], pathSegment);
				} else {
					pathSegment.populate(restMethod, segments, 1);
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
	
	private String[] splitUri(String path) {
		if (path.startsWith("/")) path = path.substring(1);
		if (path.endsWith("/")) path = path.substring(0, path.length() - 2);
		return path.split("/");
	}
	
	public Object dispatch(HttpRequest request) {
		String[] uriSegments = splitUri(request.getUri());
		PathSegmentEntry childEntry = segmentMap.get(uriSegments[0]);
		if (childEntry != null)
			return childEntry.dispatch(request, uriSegments, 1);
		else
			return null; // TODO 404
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
