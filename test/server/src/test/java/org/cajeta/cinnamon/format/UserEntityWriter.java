package org.cajeta.cinnamon.format;

import java.io.IOException;
import java.io.OutputStream;
import java.lang.annotation.Annotation;
import java.lang.reflect.Type;

import javax.ws.rs.Produces;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.MultivaluedMap;
import javax.ws.rs.ext.MessageBodyWriter;
import javax.ws.rs.ext.Provider;

import org.cajeta.cinnamon.test.entity.User;
import org.codehaus.jackson.map.ObjectMapper;

@Provider
@Produces(MediaType.APPLICATION_JSON)
public class UserEntityWriter implements MessageBodyWriter<User> {

	@Override
	public boolean isWriteable(Class<?> type, Type genericType,
			Annotation[] annotations, MediaType mediaType) {
		return (type == User.class || genericType.getClass() == User.class);
	}

	@Override
	public long getSize(User t, Class<?> type, Type genericType,
			Annotation[] annotations, MediaType mediaType) {
		// TODO Auto-generated method stub
		return 0;
	}

	@Override
	public void writeTo(User t, Class<?> type, Type genericType,
			Annotation[] annotations, MediaType mediaType,
			MultivaluedMap<String, Object> httpHeaders,
			OutputStream entityStream) throws IOException,
			WebApplicationException {
		ObjectMapper mapper = new ObjectMapper();
		mapper.writeValue(entityStream, t);
	}

}
