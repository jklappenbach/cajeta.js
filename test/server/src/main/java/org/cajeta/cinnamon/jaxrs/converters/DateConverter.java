/**
 * 
 */
package org.cajeta.cinnamon.jaxrs.converters;

import java.text.SimpleDateFormat;
import java.util.Date;

import org.cajeta.cinnamon.jaxrs.converters.Converter;

/**
 * @author julian
 *
 */
public class DateConverter implements Converter {

	@Override
	public Object convert(String str) {
		if (str == null || str.isEmpty())
			return null;

		Date date = null;

		try {
			date = (new SimpleDateFormat()).parse(str);
		} catch (Exception e) {
			// TODO Put in logging here to warn of an error
		}
		return date;
	}

}
