/**
 * 
 */
package org.cajeta.cinnamon.test.method;

import org.cajeta.cinnamon.api.annotation.ApplicationRootPath;
import org.cajeta.cinnamon.api.annotation.Consumes;
import org.cajeta.cinnamon.api.annotation.Get;
import org.cajeta.cinnamon.api.annotation.Path;
import org.cajeta.cinnamon.api.annotation.Post;
import org.cajeta.cinnamon.api.message.CinnamonResponse;
import org.cajeta.cinnamon.container.AsyncRequestHandler;
import org.cajeta.cinnamon.container.RestContainer;
import org.cajeta.cinnamon.test.entity.User;

/**
 * @author julian
 *
 */
@ApplicationRootPath("/application")
@Path("createUser") 
@Get
@Consumes("application/x-www-form-urlencoded; charset=UTF-8")
public class QueryDatabaseMethod extends AsyncRequestHandler {

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
