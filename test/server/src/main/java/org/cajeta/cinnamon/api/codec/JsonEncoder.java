package org.cajeta.cinnamon.api.codec;

import java.io.IOException;

import org.cajeta.cinnamon.api.message.CinnamonResponse;
import org.cajeta.cinnamon.api.message.RequestContext;
import org.codehaus.jackson.JsonFactory;
import org.codehaus.jackson.JsonGenerator;
import org.codehaus.jackson.map.ObjectMapper;
import org.jboss.netty.buffer.ChannelBufferOutputStream;
import org.jboss.netty.buffer.DynamicChannelBuffer;

public class JsonEncoder extends CinnamonEncoder {
	JsonFactory factory = new JsonFactory();
	ObjectMapper mapper = new ObjectMapper();

	public CinnamonResponse write(RequestContext request, CinnamonResponse response) throws EncodingException {
		DynamicChannelBuffer dcb = new DynamicChannelBuffer(1024);
		response.setContent(dcb);
		ChannelBufferOutputStream cbos = new ChannelBufferOutputStream(dcb);
		this.osm = new OutputStreamMonitor(cbos);
		JsonGenerator generator;
		try {
			generator = factory.createJsonGenerator(osm);
			mapper.writeValue(generator, response.getEntity());
		} catch (IOException e) {
			throw new EncodingException(e);
		}		
		return response;
	}
}
