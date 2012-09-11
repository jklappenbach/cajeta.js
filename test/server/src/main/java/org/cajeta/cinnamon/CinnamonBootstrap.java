/**
 * 
 */
package org.cajeta.cinnamon;

import org.cajeta.cinnamon.jaxrs.JaxRS;
import org.jboss.netty.bootstrap.ServerBootstrap;
import org.jboss.netty.channel.ChannelFactory;

/**
 * @author julian
 *
 */
public class CinnamonBootstrap extends ServerBootstrap {	
	public CinnamonBootstrap(ChannelFactory channelFactory, String commonScanPackage) {
		super(channelFactory);
		JaxRS.initialize(commonScanPackage);
	}
}
