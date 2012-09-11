/**
 * 
 */
package org.cajeta.cinnamon.jaxrs;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

import org.cajeta.cinnamon.jaxrs.converters.Converter;
import org.jboss.netty.handler.codec.http.HttpRequest;

/**
 * @author julian
 *
 */
public class RestMethodEntry implements RestDispatchEntry {
	// Definition State
	private Object instance;
	private Method method;
	private RestPathConfig restPathConfig;
	private List<RestParameterEntry> parameterEntries;
	private Set<String> consumes = new HashSet<String>();
	private Set<String> produces = new HashSet<String>();
	private Map<Class<?>, Converter> parameterConverters = JaxRS.getParamConverters();
	
	// Execution State
	private Map<String, String> urlParameters = null;
	private boolean parseMatrix = false, parseQuery = false, parsePath = false,
			parseCookie = false;
	
	public RestMethodEntry(Object instance, String methodName, RestClassEntry classEntry) {
		try {
			Class<?>[] classes = new Class<?>[parameterEntries.size()];
			int i = 0;
			for (RestParameterEntry entry : parameterEntries) {
				classes[i++] = entry.getParameterClass();
			}
			
			method = instance.getClass().getMethod(methodName, classes);
			
			consumes = classEntry.getConsumes();
			produces = classEntry.getProduces();
		} catch (NoSuchMethodException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (SecurityException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	
	@Override
	public Object execute(HttpRequest request, String[] urlSegments, int segmentIndex) {
		int argCount = parameterEntries.size(), i = 0;
		if (parseQuery)
			parseQueryParameters(urlSegments);
		if (parseMatrix)
			parseMatrixParameters(urlSegments);
		if (parsePath)
			parsePathParameters(urlSegments);
		if (parseCookie)
			parseCookieParameters(request);
		
		Map<String, String> urlParameters = new HashMap<String, String>();
		
		Object[] methodArgs = (argCount > 0) ? new Object[argCount] : null;
		for (RestParameterEntry parameterEntry : parameterEntries) {
			String parameter = "";
			switch (parameterEntry.getParameterSource()) {
				case Cookie:
					// TODO  Need to parse the cookie string for a key-value pair in the string
					parameter = request.getHeader("Set-Cookie");
					break;
				case Form:
					parameter = request.getHeader(parameterEntry.getParameterName());
					break;
				case Header:
					parameter = request.getHeader(parameterEntry.getParameterName());
					break;
				case Matrix:
					parameter = urlParameters.get(parameterEntry.getParameterName());
					break;
				case Path:
					parameter = urlParameters.get(parameterEntry.getParameterName());
					if (restPathConfig != null)
					break;
				case Query:
					parameter = urlParameters.get(parameterEntry.getParameterName());
					break;
			}
			// Check to see if we have a converter registered for the type.  If not,
			// attempt instantiation by passing a string to a constructor, if one exists.
			// otherwise, throw an exception.
			Class<?> parameterClass = parameterEntry.getParameterClass();
			if (!parameterClass.getName().equals("String")) {
				Converter converter = this.parameterConverters.get(parameterClass);
				if (converter != null) {
					methodArgs[i++] = converter.convert(parameter);
				} else if (parameterEntry.getConstructor() != null) {
					try {
						methodArgs[i++] = parameterEntry.getConstructor().newInstance(parameter);
					} catch (InstantiationException e) {
						// TODO Auto-generated catch block
						e.printStackTrace();
					} catch (IllegalAccessException e) {
						// TODO Auto-generated catch block
						e.printStackTrace();
					} catch (IllegalArgumentException e) {
						// TODO Auto-generated catch block
						e.printStackTrace();
					} catch (InvocationTargetException e) {
						// TODO Auto-generated catch block
						e.printStackTrace();
					}
				} else {
					// TODO Fix this exception
					throw new RuntimeException("B0RKED");
				}
			}
		}
		
		Object result = null;
		try {
			result = method.invoke(instance, methodArgs);
		} catch (Throwable e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return result;
	}
	
	private void parsePathParameters(String[] urlSegments) {
		Iterator<Entry<String, Integer>> itr = restPathConfig.getPathParamIndexMap().entrySet().iterator();
		while (itr.hasNext()) {
			Entry<String, Integer> entry = itr.next();
			urlParameters.put(entry.getKey(), urlSegments[entry.getValue()]); 
		}
	}
	
	private void parseQueryParameters(String[] urlSegments) {
		int questionIndex = urlSegments[urlSegments.length - 1].indexOf("?");
		String[] arguments = urlSegments[urlSegments.length - 1].substring(questionIndex + 1).split("&");
		for (String term : arguments) {
			String[] entry = term.split("=");
			// TODO Need error handling here
			urlParameters.put(entry[0], entry[1]);
		}
	}
	
	private void parseMatrixParameters(String[] urlSegments) {
		// TODO Finish me!
	}
	
	private void parseCookieParameters(HttpRequest request) {
		// TODO Finish me!
	}
		
	public Object getInstance() {
		return instance;
	}
	public void setInstance(Object instance) {
		this.instance = instance;
	}
	public Method getMethod() {
		return method;
	}
	public void setMethod(Method method) {
		this.method = method;
	}
	public List<RestParameterEntry> getParameterEntries() {
		return parameterEntries;
	}
	public void addParameterEntry(RestParameterEntry entry) {
		parameterEntries.add(entry);
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

	/**
	 * @return the pathEntry
	 */
	public RestPathConfig getPathEntry() {
		return restPathConfig;
	}

	/**
	 * @param pathEntry the pathEntry to set
	 */
	public void setPathEntry(RestPathConfig pathEntry) {
		this.restPathConfig = pathEntry;
	}
	
	public void parseQuery() {
		this.parseQuery = true;
	}
	public void parseMatrix() {
		this.parseMatrix = true;
	}
	public void parsePath() {
		this.parsePath = true;
	}
	public void parseCookie() {
		this.parseCookie = true;
	}
}
