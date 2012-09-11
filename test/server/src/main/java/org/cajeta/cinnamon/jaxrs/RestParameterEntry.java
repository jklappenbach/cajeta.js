/**
 * 
 */
package org.cajeta.cinnamon.jaxrs;

import java.lang.reflect.Constructor;

/**
 * @author julian
 *
 */
public class RestParameterEntry {
	private ParameterSource parameterSource;
	private String parameterName;
	private Class<?> parameterClass;
	private Constructor<?> constructor;
	private String defaultValue;
	
	public RestParameterEntry(ParameterSource parameterSource, String parameterName,
			Class<?> parameterClass, String defaultValue) {
		this.parameterSource = parameterSource;
		this.parameterName = parameterName;
		this.parameterClass = parameterClass;
		try {
			constructor = parameterClass.getConstructor(String.class);
		} catch (Exception e) {
			e.printStackTrace();
		}
		this.defaultValue = defaultValue;
	}

	public ParameterSource getParameterSource() {
		return parameterSource;
	}

	public void setParameterSource(ParameterSource parameterSource) {
		this.parameterSource = parameterSource;
	}

	public String getParameterName() {
		return parameterName;
	}

	public void setParameterName(String parameterName) {
		this.parameterName = parameterName;
	}

	public Class<?> getParameterClass() {
		return parameterClass;
	}

	public void setParameterClass(Class<?> parameterClass) {
		this.parameterClass = parameterClass;
	}

	public String getDefaultValue() {
		return defaultValue;
	}

	public void setDefaultValue(String defaultValue) {
		this.defaultValue = defaultValue;
	}

	/**
	 * @return the constructor
	 */
	public Constructor<?> getConstructor() {
		return constructor;
	}

	/**
	 * @param constructor the constructor to set
	 */
	public void setConstructor(Constructor<?> constructor) {
		this.constructor = constructor;
	}
}
