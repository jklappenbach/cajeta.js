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

import static org.jboss.netty.handler.codec.http.HttpHeaders.*;
import static org.jboss.netty.handler.codec.http.HttpHeaders.Names.*;
import static org.jboss.netty.handler.codec.http.HttpResponseStatus.*;
import static org.jboss.netty.handler.codec.http.HttpVersion.*;

import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

import org.cajeta.cinnamon.jaxrs.JaxRS;
import org.jboss.netty.buffer.ChannelBuffer;
import org.jboss.netty.buffer.ChannelBuffers;
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
	private HttpRequest request = null;
	private static JaxRS container = JaxRS.getInstance();

	@Override
	public void messageReceived(ChannelHandlerContext ctx, MessageEvent e)
			throws Exception {
		if (!readingChunks) {
			request = (HttpRequest) e.getMessage();

			if (is100ContinueExpected(request)) {
				send100Continue(e);
			}

			content.setLength(0);

			if (request.isChunked()) {
				readingChunks = true;
			} else {
				Object result = container.dispatch(request);
				System.out.println(result.toString());
				
			}
		} else {
			HttpChunk chunk = (HttpChunk) e.getMessage();
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

				writeResponse(e);
			} else {
				content.append("CHUNK: "
						+ chunk.getContent().toString(CharsetUtil.UTF_8)
						+ "\r\n");
			}
		}
	}

	private void writeResponse(MessageEvent e) {
		// Decide whether to close the connection or not.
		boolean keepAlive = isKeepAlive(request);

		// Build the response object.
		HttpResponse response = new DefaultHttpResponse(HTTP_1_1, OK);
//		response.setContent(ChannelBuffers.copiedBuffer(buf.toString(),
//				CharsetUtil.UTF_8));
		response.setHeader(CONTENT_TYPE, "text/plain; charset=UTF-8");

		if (keepAlive) {
			// Add 'Content-Length' header only for a keep-alive connection.
			response.setHeader(CONTENT_LENGTH, response.getContent()
					.readableBytes());
			// Add keep alive header as per:
			// -
			// http://www.w3.org/Protocols/HTTP/1.1/draft-ietf-http-v11-spec-01.html#Connection
			response.setHeader(CONNECTION, HttpHeaders.Values.KEEP_ALIVE);
		}

		// Encode the cookie.
		String cookieString = request.getHeader(COOKIE);
		if (cookieString != null) {
			CookieDecoder cookieDecoder = new CookieDecoder();
			Set<Cookie> cookies = cookieDecoder.decode(cookieString);
			if (!cookies.isEmpty()) {
				// Reset the cookies if necessary.
				CookieEncoder cookieEncoder = new CookieEncoder(true);
				for (Cookie cookie : cookies) {
					cookieEncoder.addCookie(cookie);
					response.addHeader(SET_COOKIE, cookieEncoder.encode());
				}
			}
		} else {
			// Browser sent no cookie. Add some.
			CookieEncoder cookieEncoder = new CookieEncoder(true);
			cookieEncoder.addCookie("key1", "value1");
			response.addHeader(SET_COOKIE, cookieEncoder.encode());
			cookieEncoder.addCookie("key2", "value2");
			response.addHeader(SET_COOKIE, cookieEncoder.encode());
		}

		// Write the response.
		ChannelFuture future = e.getChannel().write(response);

		// Close the non-keep-alive connection after the write operation is
		// done.
		if (!keepAlive) {
			future.addListener(ChannelFutureListener.CLOSE);
		}
	}

	private static void send100Continue(MessageEvent e) {
		HttpResponse response = new DefaultHttpResponse(HTTP_1_1, CONTINUE);
		e.getChannel().write(response);
	}

	@Override
	public void exceptionCaught(ChannelHandlerContext ctx, ExceptionEvent e)
			throws Exception {
		e.getCause().printStackTrace();
		e.getChannel().close();
	}
}
