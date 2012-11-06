/**
 * 
 */
package org.cajeta.server.test.method;

import org.cajeta.cinnamon.container.RestContainer;
import org.cajeta.cinnamon.rest.AsyncRequestHandler;
import org.cajeta.cinnamon.rest.annotation.ApplicationRootPath;
import org.cajeta.cinnamon.rest.annotation.Consumes;
import org.cajeta.cinnamon.rest.annotation.Path;
import org.cajeta.cinnamon.rest.annotation.Post;
import org.cajeta.cinnamon.rest.message.CinnamonResponse;
import org.cajeta.server.test.entity.User;

/**
 * @author julian
 *
 */
@ApplicationRootPath("/application")
@Path("createUser") 
@Post
@Consumes("application/x-www-form-urlencoded; charset=UTF-8")
public class QueryDatabaseMethod extends AsyncRequestHandler {

	public void run() {
		// Get the posted data...
		User user = new User();
		user.setFirstName("Athena");
		user.setLastName("Klappenbach");
		user.setIconUrl("http://images.com/athena");
		user.setPassword("password");
		user.setDiet(requestContext.getFormParameter("diet"));
		CinnamonResponse response = new CinnamonResponse();
		response.setEntity(user);
		RestContainer.writeResponse(requestContext, response);	
	}	
}
