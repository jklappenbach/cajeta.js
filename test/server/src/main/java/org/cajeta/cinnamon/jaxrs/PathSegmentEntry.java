/**
 * 
 */
package org.cajeta.cinnamon.jaxrs;

import java.lang.reflect.Method;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;

import javax.ws.rs.core.Response;

import org.jboss.netty.handler.codec.http.HttpMethod;
import org.jboss.netty.handler.codec.http.HttpRequest;

/**
 * PathSegment performs routing and dynamic method invocation.  Methods are stored as:
 * A Map relating request methods (GET, POST, ETC) to a Mapping of consumption format values to Maps of RestMethods, 
 * indexed by production formats.  Yes.  Complicated.  But that's the spec.
 * 
 * There should be *only one* mapping of a consumption and production format pair to a method.  Duplicates
 * will result in new additions overwriting existing map entries.  Only the last will be called.
 * 
 * If a production format is not specified for either RequestHeader:Content-Type or RequestHeader:Accepts, a default 
 * of text/html will be used.  In the event that formats for both production and consumption can not be matched with
 * a method, HTTP 406 will be returned.
 * 
 * @author julian
 */
public class PathSegmentEntry {
	
	private Map<String, RestMethod> methods = new HashMap<String, RestMethod>();
	private Map<String, RestMethod> lookupCache = new HashMap<String, RestMethod>();
	private Map<String, PathSegmentEntry> pathSegments = new HashMap<String, PathSegmentEntry>();
	
	
	// TODO Define how rest methods will be invoked here, as well as how param links in a url
	// will be traversed.
	//private Map<String, Rest>
	private PathSegmentEntry wildcard = null;
	private Pattern filter = null; 
	
	public PathSegmentEntry() { }	
	public PathSegmentEntry(RestMethod restMethod, String[] segments, int level) {
		populate(restMethod, segments, level);
	}
	
	
	public Object dispatch(HttpRequest request, String[] uriSegments, int segmentIndex) {
		if (wildcard != null) {
			return wildcard.dispatch(request, uriSegments, ++segmentIndex);
		}
		if (segmentIndex < uriSegments.length) {
			PathSegmentEntry childEntry = pathSegments.get(uriSegments[segmentIndex]);
			if (childEntry != null)
				return childEntry.dispatch(request,  uriSegments,  ++segmentIndex);
			else
				return null; // TODO 404
		} else {
			HttpMethod httpMethod = request.getMethod();
			String consumes = request.getHeader("Content-Type");
			if (consumes == null) consumes = "text/plain";
			String produces = request.getHeader("Accept");
			if (produces == null) produces = "text/plain";
			
			// Make a check against our cached method map...
			RestMethod methodEntry = lookupCache.get(httpMethod.getName() + consumes + produces);
			
			// If not, execute the logic to resolve the method
			if (methodEntry != null) {
				return methodEntry.execute(request, uriSegments);
			} else {
				methodEntry = resolveMethod(httpMethod, consumes, produces);
			}
			if (methodEntry == null) {
				return null; // TODO 415
			} else {
				lookupCache.put(httpMethod.getName() + consumes + produces, methodEntry);
				Response response;
				return methodEntry.execute(request, uriSegments);
			}
		}
	}
	
	/**
	 * Cases - Client requests using requestMethod and:
	 * 
	 * 1.  non-wildcard consumes and produces
	 * 2.  wildcard (or unspecified) in either or both consumes or produces
	 * 
	 * Methods also specify what they will accept and produce, and may have more than one entry.
	 * We need to handle the case where the client specifies a content-type, and we don't care because
	 * the method supports the wildcard for either consumption or production.   
	 * 
	 * @param httpMethod
	 * @param consumes
	 * @param produces
	 * @return
	 */
	private RestMethod resolveMethod(HttpMethod httpMethod, String consumes, String produces) {
		// First, if consumes and produces are both supported without wildcards		
		RestMethod restMethod = null;
		
		// Check first for wildcard entries on the request.  We remove these from the key
		// In anticipation, the map has been populated with partial key entries for each method to support this. 
		if (restMethod == null && (consumes.equals(RestMethod.ALL_FORMATS) || 
				produces.equals(RestMethod.ALL_FORMATS))) {
			String key = httpMethod.getName();
			if (!consumes.equals(RestMethod.ALL_FORMATS)) {
				key += RestMethod.CONSUMES + consumes; 
			}
			if (!produces.equals(RestMethod.ALL_FORMATS)) {
				key += RestMethod.PRODUCES + produces;
			}
			restMethod = methods.get(key);
		}
			
		// Still unresolved?  We may have wildcard entries on the method
		if (restMethod == null) {
			restMethod = methods.get(httpMethod.getName() + RestMethod.CONSUMES + RestMethod.ALL_FORMATS + 
					RestMethod.PRODUCES + produces);
			if (restMethod == null) {
				restMethod = methods.get(httpMethod.getName() + RestMethod.CONSUMES + consumes + 
						RestMethod.PRODUCES + RestMethod.ALL_FORMATS);
				if (restMethod == null)
					restMethod = methods.get(httpMethod.getName() + RestMethod.ALL_FORMATS + RestMethod.ALL_FORMATS);
			}				
		}
		
		return restMethod;	
	}
	
	/**
	 * 
	 * @param segmentName
	 * @param segmentEntry
	 */
	public void addSegmentEntry(String segmentName, PathSegmentEntry segmentEntry) {
		if (segmentName.contains("{")) {
			wildcard = segmentEntry;
			if (!pathSegments.isEmpty())
				throw new RuntimeException("Unreachable!");
		} else {
			this.pathSegments.put(segmentName, segmentEntry);
		}
	}
	
	/**
	 * Add a method to the map for this segment.  Only add methods that are resolved by 
	 * the termination of the url with this segment.
	 * 
	 * @param method
	 * @param segments 
	 * @param level 
	 */
	public void populate(RestMethod restMethod, String[] segments, int level) {
		// First, recurse out until we've populated the path...
		if (level < segments.length) {
			PathSegmentEntry childEntry = this.pathSegments.get(segments[level]);
			if (childEntry == null) {
				childEntry = new PathSegmentEntry(restMethod, segments, level + 1);
				pathSegments.put(segments[level], childEntry);
			} else {
				childEntry.populate(restMethod, segments, level + 1);
			}
		} else {
			// Second, add the method and populate the supported format sets
			// HttpMethod { Consumer[*] {  
			//         
			Set<String> setConsumption = restMethod.getConsumes(), setProduction = restMethod.getProduces();
			for (String consumes : setConsumption) {
				for (String produces : setProduction) {
					methods.put(restMethod.getHttpMethod().getName(), restMethod);
					methods.put(restMethod.getHttpMethod().getName() + RestMethod.CONSUMES + consumes , restMethod);
					methods.put(restMethod.getHttpMethod().getName() + RestMethod.PRODUCES + produces, restMethod);
					methods.put(restMethod.getHttpMethod().getName() + RestMethod.CONSUMES + consumes + RestMethod.PRODUCES + produces, restMethod);
				}
			}
		}
	}
}
