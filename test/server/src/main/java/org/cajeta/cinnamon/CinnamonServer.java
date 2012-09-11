package org.cajeta.cinnamon;

import java.net.InetSocketAddress;
import java.util.concurrent.Executors;

import org.jboss.netty.bootstrap.ServerBootstrap;
import org.jboss.netty.channel.socket.nio.NioServerSocketChannelFactory;

/**
 * Hello world!
 * 
 */
public class CinnamonServer {
	public static void main(String[] args) {
		
        // Configure the server.
        CinnamonBootstrap bootstrap = new CinnamonBootstrap(
				new NioServerSocketChannelFactory(
				        Executors.newCachedThreadPool(),
				        Executors.newCachedThreadPool()),
				"org.cajeta.cinnamon");

        // Set up the event pipeline factory.
        bootstrap.setPipelineFactory(new CinnamonServerPipelineFactory());

        // Bind and start to accept incoming connections.
        bootstrap.bind(new InetSocketAddress(8080));		
	}
}
