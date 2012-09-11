/**
 * 
 */
package org.cajeta.cinnamon.jaxrs;

import java.util.HashMap;
import java.util.Map;

/**
 * @author julian
 *
 */
public class RestPathConfig {
	private String mapKey;
	private Map<String, Integer> pathParamIndexMap = new HashMap<String, Integer>();
	
	public String getMapKey() {
		return mapKey;
	}
	public void setMapKey(String mapKey) {
		this.mapKey = mapKey;
	}
	public Map<String, Integer> getPathParamIndexMap() {
		return pathParamIndexMap;
	}
	public void setPathParamIndexMap(Map<String, Integer> pathParamIndexMap) {
		this.pathParamIndexMap = pathParamIndexMap;
	}
	public void addPathParam(String paramName, Integer segmentIndex) {
		pathParamIndexMap.put(paramName, segmentIndex);
	}
}
