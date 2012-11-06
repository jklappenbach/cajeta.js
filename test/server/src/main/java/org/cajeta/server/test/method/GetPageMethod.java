/**
 * 
 */
package org.cajeta.server.test.method;

import org.cajeta.cinnamon.rest.RequestContext;
import org.cajeta.cinnamon.rest.RequestMethod;
import org.cajeta.cinnamon.rest.annotation.ApplicationRootPath;
import org.cajeta.cinnamon.rest.annotation.Consumes;
import org.cajeta.cinnamon.rest.annotation.Get;
import org.cajeta.cinnamon.rest.annotation.Path;
import org.cajeta.cinnamon.rest.message.CinnamonResponse;
import io.netty.handler.codec.http.HttpResponseStatus;

/**
 * @author julian
 *
 */
@ApplicationRootPath("/application")
@Path("restApi") 
@Get
@Consumes("application/x-www-form-urlencoded; charset=UTF-8")
public class GetPageMethod extends RequestMethod {

	@Override
	public CinnamonResponse execute(RequestContext httpRequestContext) {
		CinnamonResponse response = new CinnamonResponse(HttpResponseStatus.OK);
		response.setEntity("<html><body><div>Hello World!</div></body></html>");
		return response;
	}	
}
