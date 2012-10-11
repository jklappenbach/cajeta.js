/**
 * 
 */
package org.cajeta.cinnamon.container;

import static org.jboss.netty.handler.codec.http.HttpHeaders.isKeepAlive;
import static org.jboss.netty.handler.codec.http.HttpHeaders.Names.CONNECTION;
import static org.jboss.netty.handler.codec.http.HttpHeaders.Names.CONTENT_LENGTH;
import static org.jboss.netty.handler.codec.http.HttpHeaders.Names.CONTENT_TYPE;
import static org.jboss.netty.handler.codec.http.HttpHeaders.Names.COOKIE;
import static org.jboss.netty.handler.codec.http.HttpHeaders.Names.SET_COOKIE;

import java.io.DataInputStream;
import java.io.File;
import java.io.FileFilter;
import java.io.FileInputStream;
import java.io.IOException;
import java.lang.annotation.Annotation;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;
import java.util.Set;

import org.cajeta.cinnamon.CinnamonUtil;
import org.cajeta.cinnamon.api.annotation.ApplicationRootPath;
import org.cajeta.cinnamon.api.annotation.Consumes;
import org.cajeta.cinnamon.api.annotation.Delete;
import org.cajeta.cinnamon.api.annotation.Get;
import org.cajeta.cinnamon.api.annotation.Head;
import org.cajeta.cinnamon.api.annotation.Options;
import org.cajeta.cinnamon.api.annotation.Path;
import org.cajeta.cinnamon.api.annotation.Post;
import org.cajeta.cinnamon.api.annotation.Put;
import org.cajeta.cinnamon.api.codec.BinaryEncoder;
import org.cajeta.cinnamon.api.codec.CinnamonEncoder;
import org.cajeta.cinnamon.api.codec.EncodingException;
import org.cajeta.cinnamon.api.codec.JsonEncoder;
import org.cajeta.cinnamon.api.codec.PlainTextEncoder;
import org.cajeta.cinnamon.api.codec.XmlEncoder;
import org.cajeta.cinnamon.api.message.CinnamonResponse;
import org.cajeta.cinnamon.api.message.RequestContext;
import org.jboss.netty.buffer.ChannelBuffers;
import org.jboss.netty.channel.ChannelFuture;
import org.jboss.netty.channel.ChannelFutureListener;
import org.jboss.netty.handler.codec.http.Cookie;
import org.jboss.netty.handler.codec.http.CookieDecoder;
import org.jboss.netty.handler.codec.http.CookieEncoder;
import org.jboss.netty.handler.codec.http.HttpHeaders;
import org.jboss.netty.handler.codec.http.HttpMethod;
import org.jboss.netty.handler.codec.http.HttpRequest;
import org.jboss.netty.handler.codec.http.HttpResponseStatus;
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
	private final Properties prop = new Properties();
	private final static Logger logger = LoggerFactory.getLogger(RestContainer.class);
	private final Map<String, PathSegmentEntry> segmentEntries = new HashMap<String, PathSegmentEntry>();
	private final Map<Class<? extends RequestMethod>, RequestMethod> typeMap = new HashMap<Class<? extends RequestMethod>, RequestMethod>();
	private final Map<String, DocumentCacheEntry> documents = new HashMap<String, DocumentCacheEntry>();
	private String documentRoot = ""; 
	private static final String DOCUMENT_ROOT = "document.root";
	private static final String DOCUMENT_EXTENSIONS = "document.extensions";
	private static final String CACHE_ENABLED = "filecache.enabled";
	private static Map<String, String> extensions = new HashMap<String, String>();
	private static final Map<String, CinnamonEncoder> encoders = new HashMap<String, CinnamonEncoder>();


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
		
    	try {
    		prop.load(new FileInputStream("cinnamon.properties"));
    	} catch (IOException e) {
    		logger.info("Unable to load properties file, using system defaults.");
    	}
    	
    	// TODO Set up property driven encoder classes
    	CinnamonEncoder jsonEncoder = new JsonEncoder();
    	XmlEncoder xmlEncoder = new XmlEncoder();
    	PlainTextEncoder plainTextEncoder = new PlainTextEncoder();
    	BinaryEncoder binaryEncoder = new BinaryEncoder();
    	
		// Set up the encoding types
		encoders.put("application/xml", xmlEncoder);
		encoders.put("application/svg", xmlEncoder);
		encoders.put("application/schema",  xmlEncoder);
		encoders.put("application/json", jsonEncoder);
		encoders.put("text/plain", plainTextEncoder);
		encoders.put("text/html", plainTextEncoder);
		encoders.put("application/javascript", plainTextEncoder);
		encoders.put("image/ico", binaryEncoder);
		encoders.put("image/jpeg", binaryEncoder);
		encoders.put("image/png", binaryEncoder);
		encoders.put("image/gif" , binaryEncoder);
		
		// Install the default converters
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
				RequestMethod handlerEntry = (RequestMethod) c.newInstance();
				handlerEntry.setPath(c.getAnnotation(Path.class).value());
				typeMap.put((Class<? extends RequestMethod>) c, handlerEntry);
			}
			
			// Consumes annotation search
			classes = reflections.getTypesAnnotatedWith(Consumes.class);	
			for (Class<?> c : classes) {
				// First check to see if the entry already exists.  If not, create it
				RequestMethod handlerEntry = typeMap.get(c);
				if (handlerEntry == null) {
					handlerEntry = (RequestMethod) c.newInstance();
					typeMap.put((Class<? extends RequestMethod>) c, handlerEntry);
				}
				handlerEntry.addConsumes(c.getAnnotation(Consumes.class).value());
			}
			
			// Now scan for methods with GET, POST, PUT, DELETE, HEAD, and OPTIONS
			// For each method, we track a path that will be used as its key
			processTypesWithAnnotation(Get.class, Post.class, Put.class, Delete.class, Head.class, Options.class);
			
			// Finally, load static documents...
			loadDocuments();
			
		} catch (Exception e) {
			logger.error(e.getMessage());
			e.printStackTrace();
		}
	}	

	private void processTypesWithAnnotation(Class<? extends Annotation>... annotationClasses) throws Exception {
		for (Class<? extends Annotation> annotationClass : annotationClasses) {
			Set<Class<?>> classes = reflections.getTypesAnnotatedWith(annotationClass);
			for (Class<?> c : classes) {
				String pathKey = applicationPath;
				
				// Get the owning class, if it currently exists in the map.  If not,
				// create a new entry.
				RequestMethod handlerEntry = typeMap.get(c);
				if (handlerEntry == null) {
					handlerEntry = (RequestMethod) c.newInstance();
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
		
	
	private void loadDocuments() {
    	try {
    		documentRoot = prop.getProperty(DOCUMENT_ROOT, "");
    		DocumentCacheEntry.setFileCacheEnabled(prop.getProperty(CACHE_ENABLED, "true").equals("true"));
    		if (documentRoot.length() > 0) {
    			if (prop.containsKey(DOCUMENT_EXTENSIONS)) {
    				String[] keys = prop.getProperty(DOCUMENT_EXTENSIONS).split(":");
    				for (String key : keys) {
    					String[] terms = key.split("=");
    					extensions.put(terms[0], terms[1]);
    				}
    			} else {
    				extensions.put("htm", "text/html;charset=UTF-8");
    				extensions.put("html", "text/html;charset=UTF-8");
    				extensions.put("js", "application/js;charset=UTF-8");
    				extensions.put("svg", "application/xml;charset=UTF-8");
    				extensions.put("png", "image/png");
    				extensions.put("jpg", "image/jpg");
    				extensions.put("gif", "image/gif");
    				extensions.put("ico", "image/png");
    			}
    			loadDirectory(new File(prop.getProperty(DOCUMENT_ROOT)));
    		}
    	} catch (IOException ex) {
    		ex.printStackTrace();
		}
	}
	
	private void loadDirectory(File directory) throws IOException {
		if (!directory.isDirectory()) {
			throw new IOException("Provided File must be a directory.");
		}
		File[] children = directory.listFiles(new FileFilter() {
			@Override
			public boolean accept(File file) {
				if (file.isDirectory()) return true;
				
				String fileName;
				try {
					fileName = file.getCanonicalPath();
				} catch (IOException e) {
					logger.error("IOException attempting to retrieve cannonical path for file!" + e.getMessage());
					return false;
				}
				String key = "";
				int dotIndex = fileName.lastIndexOf(".");
				if (dotIndex >= 0) {
					key = fileName.substring(dotIndex + 1);
				}
				return extensions.containsKey(key);
			}
			
		});
		for (File child : children) {
			if (child.isDirectory()) {
				loadDirectory(child);
			} else {
		        String path = child.getAbsolutePath();
		        String name = child.getName();
		        String contentType = "";
		        int index = name.lastIndexOf(".");
		        
		        if (index >= 0) {
		        	contentType = extensions.get(name.substring(index + 1));
		        } else {
		        	contentType = "text/plain;charset=UTF-8";
		        }
		        index = path.indexOf(documentRoot);
		        if (index >= 0) {
		        	DocumentCacheEntry cacheEntry = new DocumentCacheEntry();
		        	cacheEntry.setContentType(contentType);
		        	cacheEntry.setFile(child);
		        	path = path.substring(index + documentRoot.length() + 1);
		        	documents.put("/" + path, cacheEntry);
		        	logger.debug("Added document: " + "/" + path + " to cache");
		        } else {
		        	logger.error("Loading " + child.getAbsolutePath() + ": Could not find document root in path.  Something is wrong here!");
		        }
			}
		}
	}
	
	public void dispatch(RequestContext requestContext) {
		CinnamonResponse response = null;
		logger.debug("Processing request for " + requestContext.getHttpRequest().getUri().toString());
		
		// First, check to see if we have a request for a document
		DocumentCacheEntry cacheEntry = documents.get(requestContext.getHttpRequest().getUri());
		if (cacheEntry != null) {
			response = new CinnamonResponse(requestContext, HttpResponseStatus.OK);
			response.setHeader(CONTENT_TYPE, cacheEntry.getContentType());
			try {
				response.setContent(ChannelBuffers.copiedBuffer(cacheEntry.getBuffer()));
			} catch (IOException e) {
				logger.error("Could not load document cache file, possible file system corruption! " + e.getMessage());
				response.setStatus(HttpResponseStatus.INTERNAL_SERVER_ERROR);
			}
		} else {
			// If not, then recurse the segments to find our target method
			String[] uriSegments = requestContext.getUriSegments();
			PathSegmentEntry childEntry = segmentEntries.get(uriSegments[0]);
			if (childEntry != null) {
				response = childEntry.dispatch(requestContext, 1);
			}
		}
		
		// Send the response, if we have one at present.  AsyncRequestHandlers will return "null" at this point.
		if (response != null)
			writeResponse(requestContext, response);
	}
	
	static public void writeResponse(RequestContext request, CinnamonResponse response) {
		// TODO Handle other encoding types than UTF-8
		HttpRequest httpRequest = request.getHttpRequest();
		if (response.getEntity() != null) {
			String header = httpRequest.getHeader(org.jboss.netty.handler.codec.http.HttpHeaders.Names.ACCEPT);
			String encodingTerms[] = header.split(";");
			if (response.getEntity() != null) {
				CinnamonEncoder encoder = encoders.get(encodingTerms[0].trim());
				if (encoder == null) {
					response.setStatus(HttpResponseStatus.UNSUPPORTED_MEDIA_TYPE);
					return;
				}
				
				try {
					encoder.write(request, response);
				} catch (EncodingException e) {
					response.setStatus(HttpResponseStatus.INTERNAL_SERVER_ERROR);
					logger.error(e.getMessage());
				}
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

		if (response.getHeader(CONTENT_TYPE) == null) {
			response.setHeader(CONTENT_TYPE, calcResponseContentType(request));
		}
		response.setHeader(CONTENT_LENGTH, response.getContent().readableBytes());
		response.setHeader(HttpHeaders.Names.CONTENT_ENCODING, "identity");
		ChannelFuture future = request.getMessageEvent().getChannel().write(response);

		// Close the non-keep-alive connection after the write operation is
		// done.
		if (!keepAlive || response.getStatus() != HttpResponseStatus.CONTINUE) {
			future.addListener(ChannelFutureListener.CLOSE);
		}
	}	

		
	private static String calcResponseContentType(RequestContext request) {
		String[] types = request.getHttpRequest().getHeader("Accept").split(",");
		for (String type : types) {
			String[] terms = type.split(";");
			if (encoders.containsKey(terms[0].trim())) {
				return type;
			}
		}
		return "text/plain";
	}

	public synchronized static void initialize(String commonScanPackage) {
		if (theInstance == null) {
			theInstance = new RestContainer(commonScanPackage);
		}
	}
	
	public static RestContainer getInstance() { return theInstance; }	
}
