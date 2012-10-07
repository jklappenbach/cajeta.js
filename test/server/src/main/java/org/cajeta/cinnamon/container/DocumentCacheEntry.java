package org.cajeta.cinnamon.container;

public class DocumentCacheEntry {
	private byte[] buffer;
	private String contentType;

	public DocumentCacheEntry() {
		
	}

	public byte[] getBuffer() {
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
}
