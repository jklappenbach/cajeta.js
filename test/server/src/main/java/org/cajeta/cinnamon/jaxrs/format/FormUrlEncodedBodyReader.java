/**
 * 
 */
package org.cajeta.cinnamon.jaxrs.format;

import java.io.IOException;
import java.io.InputStream;
import java.lang.annotation.Annotation;
import java.lang.reflect.Type;
import java.util.Map;

import javax.ws.rs.Consumes;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.MultivaluedMap;
import javax.ws.rs.ext.MessageBodyReader;
import javax.ws.rs.ext.Provider;

/**
 * @author Julian Klappenbach jklappenbach@gmail.com
 *
 */
@Provider
@Consumes(MediaType.APPLICATION_FORM_URLENCODED)
public class FormUrlEncodedBodyReader implements MessageBodyReader<Map<String, String>> {

	@Override
	public boolean isReadable(Class<?> type, Type genericType,
			Annotation[] annotations, MediaType mediaType) {
		// TODO Auto-generated method stub
		return false;
	}

	@Override
	public Map<String, String> readFrom(Class<Map<String, String>> type,
			Type genericType, Annotation[] annotations, MediaType mediaType,
			MultivaluedMap<String, String> httpHeaders, InputStream entityStream)
			throws IOException, WebApplicationException {
		// TODO Auto-generated method stub
		return null;
	}
}
