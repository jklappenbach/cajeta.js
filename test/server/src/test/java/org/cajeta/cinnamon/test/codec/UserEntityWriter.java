package org.cajeta.cinnamon.test.codec;

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

import org.cajeta.server.test.entity.User;
import org.codehaus.jackson.map.ObjectMapper;

@Provider
@Produces(MediaType.APPLICATION_JSON)
public class UserEntityWriter implements MessageBodyWriter<User> {

	public boolean isWriteable(Class<?> type, Type genericType,
			Annotation[] annotations, MediaType mediaType) {
		return (type == User.class || genericType.getClass() == User.class);
	}

	public long getSize(User t, Class<?> type, Type genericType,
			Annotation[] annotations, MediaType mediaType) {
		// TODO Auto-generated method stub
		return 0;
	}

	public void writeTo(User t, Class<?> type, Type genericType,
			Annotation[] annotations, MediaType mediaType,
			MultivaluedMap<String, Object> httpHeaders,
			OutputStream entityStream) throws IOException,
			WebApplicationException {
		ObjectMapper mapper = new ObjectMapper();
		mapper.writeValue(entityStream, t);
	}

}
