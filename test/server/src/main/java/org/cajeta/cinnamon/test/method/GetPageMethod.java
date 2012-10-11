/**
 * 
 */
package org.cajeta.cinnamon.test.method;

import org.cajeta.cinnamon.api.annotation.ApplicationRootPath;
import org.cajeta.cinnamon.api.annotation.Consumes;
import org.cajeta.cinnamon.api.annotation.Get;
import org.cajeta.cinnamon.api.annotation.Path;
import org.cajeta.cinnamon.api.message.CinnamonResponse;
import org.cajeta.cinnamon.api.message.RequestContext;
import org.cajeta.cinnamon.container.RequestMethod;
import org.jboss.netty.handler.codec.http.HttpResponseStatus;

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
