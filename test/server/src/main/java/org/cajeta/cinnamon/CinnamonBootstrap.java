/**
 * 
 */
package org.cajeta.cinnamon;

import java.io.File;
import java.io.FileFilter;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.HashSet;
import java.util.Properties;
import java.util.Set;

import org.cajeta.cinnamon.container.RestContainer;
import org.jboss.netty.bootstrap.ServerBootstrap;
import org.jboss.netty.channel.ChannelFactory;

/**
 * @author julian
 *
 */
public class CinnamonBootstrap extends ServerBootstrap {	
	public CinnamonBootstrap(ChannelFactory channelFactory, String rootScanPackage) {
		super(channelFactory);
		RestContainer.initialize(rootScanPackage);
	}	
}
