/**
 * 
 */
package org.cajeta.cinnamon.test.entity;

/**
 * @author Julian Klappenbach jklappenbach@gmail.com
 *
 */
public class User {
	private String firstName;
	private String lastName;
	private String password;
	private String iconUrl;
	public String getFirstName() {
		return firstName;
	}
	public void setFirstName(String firstName) {
		this.firstName = firstName;
	}
	public String getLastName() {
		return lastName;
	}
	public void setLastName(String lastName) {
		this.lastName = lastName;
	}
	public String getPassword() {
		return password;
	}
	public void setPassword(String password) {
		this.password = password;
	}
	public String getIconUrl() {
		return iconUrl;
	}
	public void setIconUrl(String iconUrl) {
		this.iconUrl = iconUrl;
	}
}
