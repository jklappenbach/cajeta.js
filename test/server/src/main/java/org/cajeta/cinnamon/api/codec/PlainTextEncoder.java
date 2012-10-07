package org.cajeta.cinnamon.api.codec;

import org.cajeta.cinnamon.api.message.CinnamonResponse;
import org.cajeta.cinnamon.api.message.RequestContext;
import org.codehaus.jackson.JsonFactory;
import org.codehaus.jackson.map.ObjectMapper;
import org.jboss.netty.buffer.ChannelBuffer;
import org.jboss.netty.buffer.DynamicChannelBuffer;

public class PlainTextEncoder extends CinnamonEncoder {
	JsonFactory factory = new JsonFactory();
	ObjectMapper mapper = new ObjectMapper();

	public CinnamonResponse write(RequestContext request, CinnamonResponse response) throws EncodingException {
		String content = response.getEntity().toString();
		ChannelBuffer buffer = new DynamicChannelBuffer(content.length());
		buffer.setBytes(0, content.getBytes());
		response.setContent(buffer);
		return response;
	}
}
