/**
 * 
 */
package org.cajeta.cinnamon.handler;

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
@Path(value = "/restApi") 
public class CajetaRestDemoHandler {
	@GET
	@Produces("text/html")
	public String getHtml() {
	    return "<html lang=\"en\"><body><h1>Hello, World!!</body></h1></html>";
	}
	
	@GET
	@Produces("text/html")
	public String getPage(@HeaderParam(value = "test") int test) {
	    return "<html lang=\"en\"><body><h1>Hello, World!!</body></h1></html>";
	}	
}
