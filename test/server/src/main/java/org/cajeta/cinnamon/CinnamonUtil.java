/**
 * 
 */
package org.cajeta.cinnamon;

/**
 * @author Julian Klappenbach jklappenbach@gmail.com
 *
 */
public class CinnamonUtil {
	static public String[] splitUri(String uri) {
		if (uri.startsWith("/")) uri = uri.substring(1);
		if (uri.endsWith("/")) uri = uri.substring(0, uri.length() - 2);
		return uri.split("/");
	}
}
