/**
 * 
 */
package org.cajeta.cinnamon.jaxrs;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;

import org.jboss.netty.handler.codec.http.HttpRequest;

/**
 * PathSegment performs routing and dynamic method invocation.  Methods are stored as:
 * A Map relating consumption format values to Maps of RestMethods, indexed by production formats.
 * There should be *only one* mapping of a consumption and production format pair to a method.  Duplicates
 * will result in new additions overwriting existing map entries.  Only the last will be called.
 * 
 * If a production format is not specified for either RequestHeader:Content-Type or RequestHeader:Accepts, a default 
 * of text/html will be used.  In the event that formats for both production and consumption can not be matched with
 * a method, HTTP 406 will be returned.
 * 
 * @author julian
 */
public class PathSegment {
	
	private Map<String, Map<String, RestMethod>> methods = new HashMap<String, Map<String, RestMethod>>();
	private Map<String, RestMethod> lookupCache = new HashMap<String, RestMethod>();
	private Map<String, PathSegment> pathSegments = new HashMap<String, PathSegment>();
	
	// TODO Define how rest methods will be invoked here, as well as how param links in a url
	// will be traversed.
	//private Map<String, Rest>
	private PathSegment wildcard = null;
	private Pattern filter = null; 
	
	public PathSegment() { }	
	public PathSegment(String pathSegment, PathSegment segmentEntry) {
		addSegmentEntry(pathSegment, segmentEntry);
	}
	public Object dispatch(HttpRequest request, String[] urlSegments, int segmentIndex) {
		if (wildcard != null) {
			return wildcard.dispatch(request, urlSegments, ++segmentIndex);
		}
		if (segmentIndex < urlSegments.length) {
			return pathSegments.get(urlSegments[segmentIndex]).dispatch(request,  urlSegments,  ++segmentIndex);
		} else {
			String consumes = request.getHeader("Content-Type");
			if (consumes == null) consumes = "text/plain";
			String produces = request.getHeader("Accept");
			if (produces == null) produces = "text/plain";
			
			// Make a check against our cached method map...
			RestMethod methodEntry = lookupCache.get(consumes + produces);
			
			// If not, execute the logic to resolve the method
			if (methodEntry != null) {
				return methodEntry.execute(request, urlSegments);
			} else {
				Map<String, RestMethod> methodEntries = methods.get(consumes);
				if (methodEntries != null) {
					methodEntry = methodEntries.get(produces);
				}
			}
			if (methodEntry == null) {
				return null; // TODO 406
			} else {
				lookupCache.put(consumes + produces, methodEntry);
				return methodEntry.execute(request, urlSegments);
			}
		}
	}
	
	public void addSegmentEntry(String segment, PathSegment segmentEntry) {
		if (segment.contains("{")) {
			wildcard = segmentEntry;
			if (!pathSegments.isEmpty())
				throw new RuntimeException("Unreachable!");
		} else {
			this.pathSegments.put(segment, segmentEntry);
		}
	}
	
	/**
	 * Add a method to the map for this segment.  Only add methods that are resolved by 
	 * the termination of the url with this segment.
	 * 
	 * @param method
	 */
	public void addMethod(RestMethod method) {
		// First, get the produces and consumes values from the method
		Set<String> setConsumption = method.getConsumes(), setProduction = method.getProduces();
		for (String consumes : setConsumption) {
			Map<String, RestMethod> formatMethods = methods.get(consumes);
			if (formatMethods == null) {
				formatMethods = new HashMap<String, RestMethod>();
				methods.put(consumes, formatMethods);
			}
			for (String produces : setProduction) 
				formatMethods.put(produces, method);
		}
	}
}
