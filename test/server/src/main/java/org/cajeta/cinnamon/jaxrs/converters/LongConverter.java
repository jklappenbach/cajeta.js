/**
 * 
 */
package org.cajeta.cinnamon.jaxrs.converters;

import java.util.Date;

import org.cajeta.cinnamon.jaxrs.converters.Converter;

/**
 * @author julian
 *
 */
public class LongConverter implements Converter {

	@Override
	public Object convert(String str) {
		if (str == null || str.isEmpty())
			return null;
		return new Long(str);
	}

}
