/**
 * 
 */
package org.cajeta.cinnamon.handler;

import javax.ws.rs.ApplicationPath;
import javax.ws.rs.Consumes;
import javax.ws.rs.FormParam;
import javax.ws.rs.GET;
import javax.ws.rs.HeaderParam;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;

/**
 * @author julian
 *
 */
@ApplicationPath("/application")
@Path("restApi") 
public class CajetaRestDemoHandler {
	@GET
	@Produces("text/plain")
	public String getHtml() {
	    return "<html lang=\"en\"><body><h1>Hello, World!!</body></h1></html>";
	}
	
	@POST
	@Consumes("application/x-www-form-urlencoded; charset=UTF-8")
	@Produces("text/html")
	public String getPage(@FormParam(value = "diet") String diet) {
	    return "<html lang=\"en\"><body><h1>" + diet + "</h1></body></html>";
	}	
}
