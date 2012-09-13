/**
 * 
 */
package org.cajeta.cinnamon.jaxrs.converters;

import org.cajeta.cinnamon.jaxrs.converters.Converter;

/**
 * @author julian
 *
 */
public class IntegerConverter implements Converter {

	@Override
	public Object convert(String str) {
		if (str == null || str.isEmpty())
			return null;
		return new Integer(str);
	}

}
