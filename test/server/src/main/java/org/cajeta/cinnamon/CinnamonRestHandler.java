/*
 * Copyright 2012 The Netty Project
 *
 * The Netty Project licenses this file to you under the Apache License,
 * version 2.0 (the "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at:
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 */
package org.cajeta.cinnamon;

import static org.jboss.netty.handler.codec.http.HttpHeaders.is100ContinueExpected;
import static org.jboss.netty.handler.codec.http.HttpHeaders.isKeepAlive;
import static org.jboss.netty.handler.codec.http.HttpHeaders.Names.CONNECTION;
import static org.jboss.netty.handler.codec.http.HttpHeaders.Names.CONTENT_LENGTH;
import static org.jboss.netty.handler.codec.http.HttpHeaders.Names.CONTENT_TYPE;
import static org.jboss.netty.handler.codec.http.HttpHeaders.Names.COOKIE;
import static org.jboss.netty.handler.codec.http.HttpHeaders.Names.SET_COOKIE;
import static org.jboss.netty.handler.codec.http.HttpResponseStatus.CONTINUE;
import static org.jboss.netty.handler.codec.http.HttpResponseStatus.OK;
import static org.jboss.netty.handler.codec.http.HttpVersion.HTTP_1_1;

import java.util.Set;

import org.cajeta.cinnamon.api.message.CinnamonResponse;
import org.cajeta.cinnamon.api.message.RequestContext;
import org.cajeta.cinnamon.container.RestContainer;
import org.jboss.netty.channel.ChannelFuture;
import org.jboss.netty.channel.ChannelFutureListener;
import org.jboss.netty.channel.ChannelHandlerContext;
import org.jboss.netty.channel.ExceptionEvent;
import org.jboss.netty.channel.MessageEvent;
import org.jboss.netty.channel.SimpleChannelUpstreamHandler;
import org.jboss.netty.handler.codec.http.Cookie;
import org.jboss.netty.handler.codec.http.CookieDecoder;
import org.jboss.netty.handler.codec.http.CookieEncoder;
import org.jboss.netty.handler.codec.http.DefaultHttpResponse;
import org.jboss.netty.handler.codec.http.HttpChunk;
import org.jboss.netty.handler.codec.http.HttpChunkTrailer;
import org.jboss.netty.handler.codec.http.HttpHeaders;
import org.jboss.netty.handler.codec.http.HttpRequest;
import org.jboss.netty.handler.codec.http.HttpResponse;
import org.jboss.netty.util.CharsetUtil;

/**
 * The constructor in this class utilizes a JAX-RS binding manager to associate
 * request parameters and even url sturcture with a particular method. Since the
 * binding is done at startup, and uses reflection, simply adding a class (or
 * method) to the build with the appropriate annotations will be sufficient (no
 * descriptors necessary). See examples for more information on design and
 * caveats.
 * 
 * @author julian klappenbach
 */
public class CinnamonRestHandler extends SimpleChannelUpstreamHandler {
	private boolean readingChunks = false;
	private final StringBuilder content = new StringBuilder();
	private HttpRequest httpRequest = null;
	private static RestContainer container = RestContainer.getInstance();

	@Override
	public void messageReceived(ChannelHandlerContext ctx, MessageEvent messageEvent)
			throws Exception {
		if (!readingChunks) {
			httpRequest = (HttpRequest) messageEvent.getMessage();

			content.setLength(0);

			if (httpRequest.isChunked()) {
				readingChunks = true;
			} else {
				RequestContext requestContext = new RequestContext(httpRequest, messageEvent);
				container.dispatch(requestContext);
			}
		} else {
			HttpChunk chunk = (HttpChunk) messageEvent.getMessage();
			if (chunk.isLast()) {
				readingChunks = false;
				content.append("END OF CONTENT\r\n");

				HttpChunkTrailer trailer = (HttpChunkTrailer) chunk;
				if (!trailer.getHeaderNames().isEmpty()) {
					content.append("\r\n");
					for (String name : trailer.getHeaderNames()) {
						for (String value : trailer.getHeaders(name)) {
							content.append("TRAILING HEADER: " + name + " = "
									+ value + "\r\n");
						}
					}
					content.append("\r\n");
				}

				//writeResponse(messageEvent);
			} else {
				content.append("CHUNK: "
						+ chunk.getContent().toString(CharsetUtil.UTF_8)
						+ "\r\n");
			}
		}
	}
}
