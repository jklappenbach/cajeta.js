/**
 * 
 */
package org.cajeta.cinnamon.jaxrs;

import java.io.UnsupportedEncodingException;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.net.URLDecoder;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

import javax.ws.rs.QueryParam;

import org.cajeta.cinnamon.CinnamonRestHandler;
import org.cajeta.cinnamon.jaxrs.converters.Converter;
import org.jboss.netty.handler.codec.http.HttpMethod;
import org.jboss.netty.handler.codec.http.HttpRequest;
import org.jboss.netty.util.CharsetUtil;

/**
 * @author julian
 *
 */
public class RestMethod {
	// Definition State
	private Object instance;
	private Method method;
	private HttpMethod httpMethod;
	private RestPathConfig restPathConfig;
	private Map<String, String> formParameters;
	private List<RestParameter> parameterEntries = new LinkedList<RestParameter>();
	private Set<String> consumes = new HashSet<String>();
	private Set<String> produces = new HashSet<String>();
	private Map<Class<?>, Converter> parameterConverters = JaxRS.getParamConverters();
	public static final String ALL_FORMATS = "*/*";
	public static final String CONSUMES = ":consumes= ";
	public static final String PRODUCES = ":produces= ";
	
	// Execution State
	private Map<String, String> urlParameters = null;
	private boolean parseMatrix = false, parseQuery = false, parsePath = false,
			parseCookie = false, parseForm = false;
	
	public RestMethod(RestClass classEntry, Object instance, Method method, HttpMethod httpMethod) {
		this.method = method;
		this.instance = instance;
		this.httpMethod = httpMethod;

		consumes.addAll(classEntry.getConsumes());
		produces.addAll(classEntry.getProduces());
	}
	
	public Object execute(HttpRequest request, String[] urlSegments) {
		int argCount = parameterEntries.size(), i = 0;
		if (parseQuery)
			parseQueryParameters(urlSegments);
		if (parseMatrix)
			parseMatrixParameters(urlSegments);
		if (parsePath)
			parsePathParameters(urlSegments);
		if (parseCookie)
			parseCookieParameters(request);
		if (parseForm)
			parseFormParameters(request);
		
		Map<String, String> urlParameters = new HashMap<String, String>();
		
		Object[] methodArgs = (argCount > 0) ? new Object[argCount] : null;
		for (RestParameter parameterEntry : parameterEntries) {
			String parameter = "";
			
			// TODO getParameterSource returns null!!
			switch (parameterEntry.getParameterSource()) {
				case Cookie:
					// TODO  Need to parse the cookie string for a key-value pair in the string
					parameter = request.getHeader("Set-Cookie");
					break;
				case Form:
					parameter = formParameters.get(parameterEntry.getParameterName());
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
			if (!parameterClass.getName().equals(String.class.getName())) {
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
			} else {
				methodArgs[i++] = parameter;
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
	
	private void parseFormParameters(HttpRequest request) {
		String content = request.getContent().toString(CharsetUtil.UTF_8);
		if (content != null)
			try {
				content = URLDecoder.decode(content, "UTF-8");
			} catch (UnsupportedEncodingException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
				return;
			}
		else
			return;
		String[] formParams = content.split("&");
		String[] keyValue;
		String value;
		for (String param : formParams) {
			keyValue = param.split("=");
			if (keyValue.length == 0)
				continue;
			value = (keyValue.length > 1) ? keyValue[1] : "";
			formParameters.put(keyValue[0], value);
		}
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
	public List<RestParameter> getParameterEntries() {
		return parameterEntries;
	}
	public void addParameterEntry(RestParameter entry) {
		parameterEntries.add(entry);
	}
	/**
	 * @return the consumes
	 */
	public Set<String> getConsumes() {
		if (consumes.isEmpty())
			consumes.add(ALL_FORMATS);

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
		if (produces.isEmpty())
			produces.add(ALL_FORMATS);
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
	public void parseForm() {
		this.formParameters = new HashMap<String, String>();
		this.parseForm = true;
	}

	/**
	 * @return the httpMethod
	 */
	public HttpMethod getHttpMethod() {
		return httpMethod;
	}

	/**
	 * @param httpMethod the httpMethod to set
	 */
	public void setHttpMethod(HttpMethod httpMethod) {
		this.httpMethod = httpMethod;
	}
}
