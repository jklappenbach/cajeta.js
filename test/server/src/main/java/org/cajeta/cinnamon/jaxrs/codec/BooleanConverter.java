/**
 * 
 */
package org.cajeta.cinnamon.jaxrs.codec;

import org.cajeta.cinnamon.jaxrs.codec.Converter;

/**
 * @author julian
 *
 */
public class BooleanConverter implements Converter {

	@Override
	public Object convert(String str) {
		if (str == null || str.isEmpty())
			return null;
		return new Boolean(str);
	}

}
