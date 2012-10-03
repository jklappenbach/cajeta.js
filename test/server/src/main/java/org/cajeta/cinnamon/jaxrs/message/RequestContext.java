/**
 * 
 */
package org.cajeta.cinnamon.jaxrs.message;

import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.util.HashMap;
import java.util.Map;

import org.jboss.netty.channel.MessageEvent;
import org.jboss.netty.handler.codec.http.HttpRequest;
import org.jboss.netty.util.CharsetUtil;

/**
 * @author Julian Klappenbach jklappenbach@gmail.com
 *
 */
public class RequestContext {
    private MessageEvent messageEvent;
    private HttpRequest httpRequest;
	private Map<String, String> formParameters = null;
	private Map<String, String> queryParameters = null;
	private Map<String, String> matrixParameters = null;
	private String[] uriSegments;
    
    public RequestContext(HttpRequest httpRequest, MessageEvent messageEvent) {
    	this.httpRequest = httpRequest;
        this.messageEvent = messageEvent;
        this.uriSegments = splitUri(httpRequest.getUri());
    }

	public MessageEvent getMessageEvent() {
		return messageEvent;
	}

	public void setMessageEvent(MessageEvent messageEvent) {
		this.messageEvent = messageEvent;
	}

	public HttpRequest getHttpRequest() {
		return httpRequest;
	}

	public void setHttpRequest(HttpRequest httpRequest) {
		this.httpRequest = httpRequest;
	}
	
	public String getFormParameter(String key) {
		if (formParameters == null) {
			parseFormParameters();
		}
		return formParameters.get(key);
	}
	
	public String getQueryParameter(String key) {
		if (queryParameters == null) {
			parseQueryParameters();
		}
		
		return queryParameters.get(key);
	}
	
	public String getPathParameter(int index) {
		return uriSegments[index];
	}
	
	public String getMatrixParameter(String key) {
		if (matrixParameters == null)
			parseMatrixParameters(); 
		
		return matrixParameters.get(key);
	}
	
	public String[] getUriSegments() {
		return uriSegments;
	}

	public void setUriSegments(String[] uriSegments) {
		this.uriSegments = uriSegments;
	}

	private void parseQueryParameters() {
		queryParameters = new HashMap<String, String>();

		int questionIndex = uriSegments[uriSegments.length - 1].indexOf("?");
		String[] arguments = uriSegments[uriSegments.length - 1].substring(questionIndex + 1).split("&");
		for (String term : arguments) {
			String[] entry = term.split("=");
			// TODO Need error handling here
			queryParameters.put(entry[0], entry[1]);
		}
	}
	
	private void parseMatrixParameters() {
		// TODO Finish me!
	}
	
	private void parseCookieParameters() {
		// TODO Finish me!
	}
	
	private void parseFormParameters() {
		formParameters = new HashMap<String, String>();
		String content = httpRequest.getContent().toString(CharsetUtil.UTF_8);
		if (content != null)
			try {
				content = URLDecoder.decode(content, "UTF-8");
			} catch (UnsupportedEncodingException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
				return;
			}
		else
			return;
		String[] formParams = content.split("&");
		String[] keyValue;
		String value;
		for (String param : formParams) {
			keyValue = param.split("=");
			if (keyValue.length == 0)
				continue;
			value = (keyValue.length > 1) ? keyValue[1] : "";
			formParameters.put(keyValue[0], value);
		}
	}
	
	/**
	 * 
	 * @param uri
	 * @return
	 */
	private String[] splitUri(String uri) {
		if (uri.startsWith("/")) uri = uri.substring(1);
		if (uri.endsWith("/")) uri = uri.substring(0, uri.length() - 2);
		return uri.split("/");
	}
}
