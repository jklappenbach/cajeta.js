/**
 * 
 */
package org.cajeta.cinnamon.test.method;

import org.cajeta.cinnamon.jaxrs.AsyncRequestHandler;
import org.cajeta.cinnamon.jaxrs.RestContainer;
import org.cajeta.cinnamon.jaxrs.annotation.ApplicationRootPath;
import org.cajeta.cinnamon.jaxrs.annotation.Consumes;
import org.cajeta.cinnamon.jaxrs.annotation.Get;
import org.cajeta.cinnamon.jaxrs.annotation.Path;
import org.cajeta.cinnamon.jaxrs.annotation.Post;
import org.cajeta.cinnamon.jaxrs.message.CinnamonResponse;
import org.cajeta.cinnamon.test.entity.User;

/**
 * @author julian
 *
 */
@ApplicationRootPath("/application")
@Path("createUser") 
@Post
@Consumes("application/x-www-form-urlencoded; charset=UTF-8")
public class QueryDatabaseMethod extends AsyncRequestHandler {

	@Override
	public void run() {
		User user = new User();
		user.setFirstName("Athena");
		user.setLastName("Saphira");
		user.setIconUrl("http://images.com/athena");
		user.setPassword("password");
		CinnamonResponse response = new CinnamonResponse();
		response.setEntity(user);
		RestContainer.writeResponse(requestContext, response);	
	}	
}
