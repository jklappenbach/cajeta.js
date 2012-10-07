/**
 * 
 */
package org.cajeta.cinnamon.api.message;

import org.jboss.netty.buffer.DynamicChannelBuffer;
import org.jboss.netty.handler.codec.http.DefaultHttpResponse;
import org.jboss.netty.handler.codec.http.HttpResponseStatus;
import org.jboss.netty.handler.codec.http.HttpVersion;

/**
 * @author Julian Klappenbach jklappenbach@gmail.com
 *
 */
public class CinnamonResponse extends DefaultHttpResponse {
	private Object entity;

	public CinnamonResponse() {
		super(HttpVersion.HTTP_1_1, HttpResponseStatus.OK);
		setContent(new DynamicChannelBuffer(1024));
	}
	public CinnamonResponse(RequestContext requestContext, HttpResponseStatus status) {
		super(HttpVersion.HTTP_1_1, status);
		setContent(new DynamicChannelBuffer(1024));
	}
	
	public CinnamonResponse(HttpResponseStatus status) {
		super(HttpVersion.HTTP_1_1, status);
		setContent(new DynamicChannelBuffer(1024));
	}
	
	public Object getEntity() {
		return entity;
	}

	public void setEntity(Object entity) {
		this.entity = entity;
	}	
}
