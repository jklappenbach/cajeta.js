/**
 * 
 */
package org.cajeta.cinnamon.container;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

import org.cajeta.cinnamon.api.message.CinnamonResponse;
import org.cajeta.cinnamon.api.message.MediaType;
import org.cajeta.cinnamon.api.message.RequestContext;
import org.jboss.netty.handler.codec.http.HttpMethod;
import org.jboss.netty.handler.codec.http.HttpResponseStatus;

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
	
	private Map<String, RequestMethod> methods = new HashMap<String, RequestMethod>();
	private Map<String, RequestMethod> lookupCache = new HashMap<String, RequestMethod>();
	private Map<String, PathSegmentEntry> pathSegments = new HashMap<String, PathSegmentEntry>();
	private PathSegmentEntry wildcard = null;
	
	public PathSegmentEntry() { }	
	public PathSegmentEntry(RequestMethod restMethod, String[] segments, int level) {
		populate(restMethod, segments, level);
	}
	
	
	public CinnamonResponse dispatch(RequestContext requestContext, int segmentIndex) {
		if (wildcard != null) {
			return wildcard.dispatch(requestContext, ++segmentIndex);
		}
		if (segmentIndex < requestContext.getUriSegments().length) {
			PathSegmentEntry childEntry = pathSegments.get(requestContext.getUriSegments()[segmentIndex]);
			if (childEntry != null)
				return childEntry.dispatch(requestContext, ++segmentIndex);
			else
				return new CinnamonResponse(requestContext, HttpResponseStatus.NOT_FOUND);
		} else {
			HttpMethod httpMethod = requestContext.getHttpRequest().getMethod();
			String consumes = requestContext.getHttpRequest().getHeader("Content-Type");
			if (consumes == null) consumes = MediaType.WILDCARD;
			
			// Make a check against our cached method map...
			RequestMethod restMethod = lookupCache.get(httpMethod.getName() + consumes);
			
			// If not, execute the logic to resolve the method
			if (restMethod == null) {
				restMethod = resolveMethod(httpMethod, consumes);
				if (restMethod != null)
					lookupCache.put(httpMethod.getName() + consumes, restMethod);
			}

			if (restMethod == null) {
				return new CinnamonResponse(HttpResponseStatus.UNSUPPORTED_MEDIA_TYPE);
			} else {
				return restMethod.execute(requestContext);
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
	private RequestMethod resolveMethod(HttpMethod httpMethod, String consumes) {
		// First, if consumes and produces are both supported without wildcards		
		RequestMethod restMethod = null;
		
		// Check first for wildcard entries on the request.  We remove these from the key
		// In anticipation, the map has been populated with partial key entries for each method to support this. 
		if (consumes.equals(MediaType.WILDCARD)) {
			String key = httpMethod.getName();
			if (!consumes.equals(MediaType.WILDCARD)) {
				key += RequestMethod.CONSUMES + consumes; 
			}
			restMethod = methods.get(key);
		}
			
		// Still unresolved?  We may have wildcard entries on the method
		if (restMethod == null) {
			restMethod = methods.get(httpMethod.getName() + RequestMethod.CONSUMES + MediaType.WILDCARD);
			if (restMethod == null) {
				restMethod = methods.get(httpMethod.getName() + RequestMethod.CONSUMES + consumes);
				if (restMethod == null)
					restMethod = methods.get(httpMethod.getName() + MediaType.WILDCARD + MediaType.WILDCARD);
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
	public void populate(RequestMethod restMethod, String[] segments, int level) {
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
			Set<String> setConsumption = restMethod.getConsumes();
			for (String consumes : setConsumption) {
				methods.put(restMethod.getHttpMethod().getName(), restMethod);
				methods.put(restMethod.getHttpMethod().getName() + RequestMethod.CONSUMES + consumes , restMethod);
			}
		}
	}
}
