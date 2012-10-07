/**
 * 
 */
package org.cajeta.cinnamon.api.codec;

/**
 * @author julian
 *
 */
public class EncodingException extends Exception {
	private static final long serialVersionUID = 1L;

	/**
	 * 
	 */
	public EncodingException() { }

	/**
	 * @param arg0
	 */
	public EncodingException(String reason) {
		super(reason);
	}

	/**
	 * @param arg0
	 */
	public EncodingException(Throwable t) {
		super(t);
	}

	/**
	 * @param arg0
	 * @param arg1
	 */
	public EncodingException(String reason, Throwable t) {
		super(reason, t);
	}

}
