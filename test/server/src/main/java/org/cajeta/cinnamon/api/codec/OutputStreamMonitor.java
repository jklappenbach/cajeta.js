/**
 * 
 */
package org.cajeta.cinnamon.api.codec;

import java.io.IOException;
import java.io.OutputStream;

/**
 * @author Julian Klappenbach jklappenbach@gmail.com
 *
 */
public class OutputStreamMonitor extends OutputStream {
    private int count;
    private OutputStream os;

    public OutputStreamMonitor(OutputStream os) {
        this.os = os;
    }

    public void write(byte[] b) throws IOException {
        os.write(b);
        count += b.length;
    }

    public void write(byte[] b, int off, int len) throws IOException {
        os.write(b, off, len);
        count += len; 
    }

    public void flush() throws IOException {
        os.flush();    
    }

    public void close() throws IOException {
        os.close();
    }

    public void write(int b) throws IOException {
        os.write(b);
        count++;
    }

    public int getBytesWritten() {
        return count;
    }
}
