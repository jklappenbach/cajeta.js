/**
 * 
 */
package org.cajeta.cinnamon.jaxrs;

import org.jboss.netty.handler.codec.http.HttpRequest;

/**
 * @author julian
 *
 */
public interface RestDispatchEntry {
	Object execute(HttpRequest request, String[] urlSegments, int segmentIndex);
}
