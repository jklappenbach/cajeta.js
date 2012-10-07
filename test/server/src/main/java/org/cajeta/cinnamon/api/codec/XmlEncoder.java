package org.cajeta.cinnamon.api.codec;

import javax.xml.bind.JAXBContext;
import javax.xml.bind.JAXBException;

import org.cajeta.cinnamon.api.message.CinnamonResponse;
import org.cajeta.cinnamon.api.message.RequestContext;
import org.codehaus.jackson.JsonFactory;
import org.codehaus.jackson.map.ObjectMapper;
import org.jboss.netty.buffer.ChannelBufferOutputStream;

public class XmlEncoder extends CinnamonEncoder {
	JsonFactory factory = new JsonFactory();
	ObjectMapper mapper = new ObjectMapper();

	public CinnamonResponse write(RequestContext request, CinnamonResponse response) throws EncodingException {
		JAXBContext jaxbContext;
		try {
			jaxbContext = JAXBContext.newInstance(response.getEntity().getClass());
			ChannelBufferOutputStream outputStream = new ChannelBufferOutputStream(response.getContent());
			OutputStreamMonitor osm = new OutputStreamMonitor(outputStream);
	        jaxbContext.createMarshaller().marshal(response.getEntity(), osm);    
		} catch (JAXBException e) {
			throw new EncodingException(e);
		}

		return response;
	}
}
