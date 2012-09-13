package org.cajeta.cinnamon.jaxrs.codec;

import java.io.IOException;
import java.io.OutputStream;
import java.lang.annotation.Annotation;
import java.lang.reflect.Type;
import java.util.HashMap;
import java.util.Map;
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
	JsonFactory factory = new JsonFactory();
	ObjectMapper mapper = new ObjectMapper();
	// May not need concurrent hashmap, depends on thread model.
	Map<Integer, OutputStreamMonitor> streamMap = new ConcurrentHashMap<Integer, OutputStreamMonitor>();

	
	@Override
	// Handles all types, but not as efficient (20 - 30% slower) than type specific encoding
	public boolean isWriteable(Class<?> type, Type genericType,
			Annotation[] annotations, MediaType mediaType) {
		return true;
	}

	@Override
	public long getSize(Object t, Class<?> type, Type genericType,
			Annotation[] annotations, MediaType mediaType) {
		OutputStreamMonitor osm = streamMap.get(t.hashCode());
		if (osm != null) {
			return (long) osm.getBytesWritten();
		} else {
			return 0;
		}
	}

	@Override
	public void writeTo(Object t, Class<?> type, Type genericType,
			Annotation[] annotations, MediaType mediaType,
			MultivaluedMap<String, Object> httpHeaders,
			OutputStream entityStream) throws IOException,
			WebApplicationException {
		OutputStreamMonitor osm = new OutputStreamMonitor(entityStream);
		streamMap.put(new Integer(type.hashCode()), osm);
		JsonGenerator generator = factory.createJsonGenerator(osm);		
		mapper.writeValue(generator, t);
	}
}
