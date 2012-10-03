/**
 * 
 */
package org.cajeta.cinnamon.test.method;

import org.cajeta.cinnamon.jaxrs.RequestHandler;
import org.cajeta.cinnamon.jaxrs.annotation.ApplicationRootPath;
import org.cajeta.cinnamon.jaxrs.annotation.Consumes;
import org.cajeta.cinnamon.jaxrs.annotation.Get;
import org.cajeta.cinnamon.jaxrs.annotation.Path;
import org.cajeta.cinnamon.jaxrs.message.CinnamonResponse;
import org.cajeta.cinnamon.jaxrs.message.RequestContext;
import org.jboss.netty.handler.codec.http.HttpResponseStatus;

/**
 * @author julian
 *
 */
@ApplicationRootPath("/application")
@Path("restApi") 
@Get
@Consumes("application/x-www-form-urlencoded; charset=UTF-8")
public class GetPageMethod extends RequestHandler {

	@Override
	public CinnamonResponse execute(RequestContext httpRequestContext) {
		CinnamonResponse response = new CinnamonResponse(HttpResponseStatus.OK);
		response.setEntity("<html><body><div>Hello World!</div></body></html>");
		return response;
	}	
}
