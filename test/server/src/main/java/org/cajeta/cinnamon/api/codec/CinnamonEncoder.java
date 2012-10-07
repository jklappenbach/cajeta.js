/**
 * 
 */
package org.cajeta.cinnamon.api.codec;

import org.cajeta.cinnamon.api.message.CinnamonResponse;
import org.cajeta.cinnamon.api.message.RequestContext;

/**
 * @author julian
 *
 */
public abstract class CinnamonEncoder {
	protected OutputStreamMonitor osm = null;
	public int written() {
		return osm.getBytesWritten();
	}
	public abstract CinnamonResponse write(RequestContext request, CinnamonResponse response) throws EncodingException;
}
