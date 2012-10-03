/**
 * 
 */
package org.cajeta.cinnamon.jaxrs;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import org.cajeta.cinnamon.jaxrs.message.CinnamonResponse;
import org.cajeta.cinnamon.jaxrs.message.RequestContext;
import org.jboss.netty.handler.codec.http.HttpMethod;
import org.jboss.netty.handler.codec.http.HttpResponse;
import org.jboss.netty.handler.codec.http.HttpResponseStatus;

/**
 * @author Julian Klappenbach jklappenbach@gmail.com
 *
 */
public abstract class AsyncRequestHandler extends RequestHandler implements Runnable {
	private static final ExecutorService threadPool = Executors.newCachedThreadPool();
	protected RequestContext requestContext = null;
	
	public AsyncRequestHandler() {
		// TODO Auto-generated constructor stub
	}

	/**
	 * @param httpMethod
	 */
	public AsyncRequestHandler(HttpMethod httpMethod) {
		super(httpMethod);
	}	

	/* (non-Javadoc)
	 * @see org.cajeta.cinnamon.jaxrs.RequestHandler#execute(org.cajeta.cinnamon.jaxrs.message.RequestContext)
	 */
	@Override
	public CinnamonResponse execute(RequestContext requestContext) {
		this.requestContext = requestContext;
		threadPool.execute(this);
		return null; //new CinnamonResponse(HttpResponseStatus.CONTINUE);
	}

}
