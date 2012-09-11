/**
 * 
 */
package org.cajeta.cinnamon.jaxrs;

import java.util.HashMap;
import java.util.Map;
import java.util.regex.Pattern;

import org.jboss.netty.handler.codec.http.HttpRequest;

/**
 * @author julian
 *
 */
public class RestDispatchMapEntry implements RestDispatchEntry {
	private Map<String, RestDispatchEntry> pathMap = new HashMap<String, RestDispatchEntry>();
	// TODO Define how rest methods will be invoked here, as well as how param links in a url
	// will be traversed.
	//private Map<String, Rest>
	private boolean wildcard = false;
	private Pattern filter; 
	
	@Override
	public Object execute(HttpRequest request, String[] urlSegments, int segmentIndex) {
		// TODO Auto-generated method stub
		return null;
	}
	
	public void addDispatchEntry(String key, RestDispatchEntry value) {
		//dispatchMap.put(key, value);
	}
}
