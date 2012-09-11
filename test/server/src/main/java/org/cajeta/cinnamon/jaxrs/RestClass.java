/**
 * 
 */
package org.cajeta.cinnamon.jaxrs;

import java.util.HashSet;
import java.util.Set;

/**
 * @author julian
 *
 */
public class RestClass {
	private Object instance = null;
	private String path = "";
	private String[] segments = null;
	private Set<String> produces = new HashSet<String>();
	private Set<String> consumes = new HashSet<String>();
	
	public RestClass(Object instance) {
		this.instance = instance;
	}

	public Object getInstance() {
		return instance;
	}

	public void setInstance(Object instance) {
		this.instance = instance;
	}

	public String getPath() {
		return path;
	}

	public void setPath(String path) {
		this.path = path;
		segments = path.split("/");
	}

	public String[] getSegments() {
		return segments;
	}

	public void setSegments(String[] segments) {
		this.segments = segments;
	}

	/**
	 * @return the consumes
	 */
	public Set<String> getConsumes() {
		return consumes;
	}
	/**
	 * @param consumes the consumes to set
	 */
	public void addConsumes(String[] consumes) {
		for (String entry : consumes)
			this.consumes.add(entry);
	}
	/**
	 * @return the produces
	 */
	public Set<String> getProduces() {
		return produces;
	}
	/**
	 * @param produces the produces to set
	 */
	public void addProduces(String[] produces) {
		for (String entry : produces)
			this.produces.add(entry);
	}
}
