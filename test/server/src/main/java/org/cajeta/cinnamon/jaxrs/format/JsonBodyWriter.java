package org.cajeta.cinnamon.jaxrs.format;

import java.io.IOException;
import java.io.OutputStream;
import java.io.StringWriter;
import java.lang.annotation.Annotation;
import java.lang.reflect.Type;
import java.util.concurrent.ConcurrentHashMap;

import javax.ws.rs.Produces;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.MultivaluedMap;
import javax.ws.rs.ext.MessageBodyWriter;
import javax.ws.rs.ext.Provider;

import org.codehaus.jackson.JsonFactory;
import org.codehaus.jackson.JsonGenerator;
import org.codehaus.jackson.map.ObjectMapper;

@Provider
@Produces(MediaType.APPLICATION_JSON)
public class JsonBodyWriter implements MessageBodyWriter<Object> {
	private ConcurrentHashMap<Long, Long> encodedLengths;
	private ObjectMapper mapper = new ObjectMapper();
	private JsonFactory factory = new JsonFactory();

	@Override
	public boolean isWriteable(Class<?> type, Type genericType,
			Annotation[] annotations, MediaType mediaType) {
		// TODO Auto-generated method stub
		return false;
	}

	@Override
	public long getSize(Object t, Class<?> type, Type genericType,
			Annotation[] annotations, MediaType mediaType) {
		// TODO Auto-generated method stub
		return 0;
	}

	@Override
	public void writeTo(Object t, Class<?> type, Type genericType,
			Annotation[] annotations, MediaType mediaType,
			MultivaluedMap<String, Object> httpHeaders,
			OutputStream outputStream) throws IOException,
			WebApplicationException {
		JsonGenerator generator = factory.createJsonGenerator(outputStream);
		mapper.writeValue(generator, t);
	}

}
