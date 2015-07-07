<xsl:stylesheet xmlns:x="http://badgerfish.googlecode.com/build/"
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="2.0">
	<xsl:output method="xml" indent="yes" />
	<xsl:template match="/x:build">
		<project name="project" default="default">
			<target name="default" description="description">
				<mkdir dir="target/site/docbook" />
				<xsl:for-each select="x:transform">
					<xsl:for-each select="x:file">
						<exec executable="java" dir="target/site/docbook"
							failonerror="true">
							<arg value="-jar" />
							<arg value="../../dependency/saxon.jar" />
							<arg>
								<xsl:attribute name="value">../../../<xsl:value-of
									select="." /></xsl:attribute>
							</arg>
							<arg>
								<xsl:attribute name="value">../../../<xsl:value-of
									select="../@stylesheet" /></xsl:attribute>
							</arg>
						</exec>
					</xsl:for-each>
				</xsl:for-each>
			</target>
		</project>
	</xsl:template>
</xsl:stylesheet>
