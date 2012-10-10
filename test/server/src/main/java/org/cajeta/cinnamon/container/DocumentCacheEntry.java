package org.cajeta.cinnamon.container;

import java.io.DataInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;

public class DocumentCacheEntry {
	private static boolean fileCacheEnabled = true;
	private byte[] buffer = null;
	private String contentType;
	private File file;

	public DocumentCacheEntry() { }
	
	public DocumentCacheEntry(File file, String contentType) {
		this.contentType = contentType;
		this.file = file;
	}

	/**
	 * This access method supports debug mode, where the file is loaded each time instead of
	 * returning initial cache population.
	 * 
	 * @return A byte array of the file
	 * @throws IOException 
	 */
	public byte[] getBuffer() throws IOException {
		if (buffer == null || !fileCacheEnabled) {
			DataInputStream dis = new DataInputStream(new FileInputStream(file));
	        buffer = new byte[dis.available()];
	        dis.read(buffer, 0, dis.available());
	        dis.close();	
		}

		return buffer;
	}

	public void setBuffer(byte[] buffer) {
		this.buffer = buffer;
	}

	public String getContentType() {
		return contentType;
	}

	public void setContentType(String contentType) {
		this.contentType = contentType;
	}

	public File getFile() {
		return file;
	}

	public void setFile(File file) {
		this.file = file;
	}

	public static boolean isFileCacheEnabled() {
		return fileCacheEnabled;
	}

	public static void setFileCacheEnabled(boolean enabled) {
		DocumentCacheEntry.fileCacheEnabled = enabled;
	}

}
