package org.cajeta.cinnamon.api.codec;

import java.io.IOException;

import org.cajeta.cinnamon.api.message.CinnamonResponse;
import org.cajeta.cinnamon.api.message.RequestContext;
import org.codehaus.jackson.JsonFactory;
import org.codehaus.jackson.JsonGenerator;
import org.codehaus.jackson.map.ObjectMapper;
import org.jboss.netty.buffer.ChannelBufferOutputStream;
import org.jboss.netty.buffer.DynamicChannelBuffer;

public class BinaryEncoder extends CinnamonEncoder {
	JsonFactory factory = new JsonFactory();
	ObjectMapper mapper = new ObjectMapper();

	public CinnamonResponse write(RequestContext request, CinnamonResponse response) throws EncodingException {
		if (response.getEntity() != null)
			return response;
		if (!(response.getEntity() instanceof Byte[]) && !(response.getEntity() instanceof byte[]))
			throw new EncodingException("Entity type must be a byte array");
		byte[] buffer = (byte[]) response.getEntity();
		DynamicChannelBuffer dcb = new DynamicChannelBuffer(buffer.length);
		dcb.setBytes(0, buffer);
		response.setContent(dcb);
		return response;
	}
}
