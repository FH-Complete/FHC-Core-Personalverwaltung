<?php


class ValorisierungInstanz_model extends DB_Model
{

	public function __construct()
	{
		parent::__construct();
		$this->dbTable = 'hr.tbl_valorisierung_instanz';
		$this->pk = 'valorisierung_instanz_id';
	}

	public function getValorisierungInstanzForDatum($valorisierungsdatum)
	{
		$res = $this->loadWhere('valorisierungsdatum = ' . $this->escape($valorisierungsdatum));
		if( hasData($res) ) {
			return getData($res);
		}
	}

	public function loadValorisierungInstanzByKurzbz($valorisierung_kurzbz)
	{
		$res = $this->loadWhere('valorisierung_kurzbz = ' . $this->escape($valorisierung_kurzbz));
		if( hasData($res) )
		{
			$vals = getData($res);
			return $vals[0];
		}
		return null;
	}

	public function getValorisierungInstanzForDienstverhaeltnis($dienstverhaeltnis_id)
	{
		$this->addFrom($this->dbTable, 'vi');
		$this->addSelect('vi.*');
		$this->addJoin('hr.tbl_valorisierung_dienstverhaeltnis vdv', 'valorisierunginstanz_id');
		$res = $this->loadWhere('vdv.dienstverhaeltnis_id = ' . $this->escape($dienstverhaeltnis_id));
		if( hasData($res) ) {
			return (getData($res))[0];
		}
	}

	// todo get instanzen by datum
	public function getValorisierungInstanzenByDienstverhaeltnis($dienstverhaeltnis_id, $ausgewaehlt = null)
	{
		$params = [$dienstverhaeltnis_id];

		$qry = "
			SELECT
				valorisierungsdatum, valorisierung_kurzbz, oe_kurzbz, ausgewaehlt
			FROM
				hr.tbl_valorisierung_instanz vi
			WHERE
			(
				EXISTS (
					SELECT 1
					FROM
						hr.tbl_dienstverhaeltnis
					WHERE
						dienstverhaeltnis_id = ?
						AND (oe_kurzbz = vi.oe_kurzbz OR vi.oe_kurzbz IS NULL)
						AND vi.valorisierungsdatum BETWEEN COALESCE(von, '1970-01-01') AND COALESCE(bis, '2170-12-31')
				)
			)";

		if (isset($ausgewaehlt) && is_bool($ausgewaehlt))
		{
			$qry .= " AND ausgewaehlt = ?";
			$params[] = $ausgewaehlt;
		}

		$qry .=
			" ORDER BY
				valorisierungsdatum, valorisierung_kurzbz, valorisierung_instanz_id";

		return $this->execQuery($qry, $params);
	}

	public function getAllNonSelectedValorisierungInstanzen()
	{
		return $this->_getNonSelectedValorisierungInstanzen();
	}

	public function getNonSelectedValorisierungInstanzenForDate($valorisierungsdatum, $oe_kurzbz = null)
	{
		return $this->_getNonSelectedValorisierungInstanzen($valorisierungsdatum, $oe_kurzbz);
	}

	public function getNonSelectedValorisierungInstanzenBeforeDate($valorisierungsdatum, $oe_kurzbz = null)
	{
		return $this->_getNonSelectedValorisierungInstanzen(null, $oe_kurzbz, $valorisierungsdatum);
	}

	public function getValorsierungInstanzInfo($valorisierung_kurzbz)
	{
		$qry = '
			SELECT
				valorisierung_kurzbz, valorisierung_methode_kurzbz, valorisierungsdatum, oe_kurzbz, oe.bezeichnung AS oe_bezeichnung,
				vi.beschreibung AS valorisierung_instanz_beschreibung, vim.beschreibung AS valorisierung_methode_beschreibung,
				vim.valorisierung_methode_parameter
			FROM
				-- disclaimer: any references to open source editor programs are purely coincidental
				hr.tbl_valorisierung_instanz vi
				LEFT JOIN hr.tbl_valorisierung_instanz_methode vim USING (valorisierung_instanz_id)
				LEFT JOIN public.tbl_organisationseinheit oe USING (oe_kurzbz)
			WHERE
				valorisierung_kurzbz = ?
			ORDER BY
				valorisierung_instanz_id';

		return $this->execQuery($qry, ['valorisierung_kurzbz' => $valorisierung_kurzbz]);
	}

	private function _getNonSelectedValorisierungInstanzen($valorisierungsdatum = null, $oe_kurzbz = null, $maxValorisierungsdatum = null)
	{
		$params = [];

		$qry = '
			SELECT
				valorisierung_kurzbz AS value, valorisierung_kurzbz || \' (\' || valorisierungsdatum || \')\' AS label,
				\'false\'::boolean AS disabled, valorisierungsdatum, oe_kurzbz, oe.bezeichnung AS oe_bezeichnung
			FROM
				hr.tbl_valorisierung_instanz vi
				LEFT JOIN public.tbl_organisationseinheit oe USING (oe_kurzbz)
			WHERE
				ausgewaehlt = FALSE
				AND NOT EXISTS (
					SELECT 1
					FROM
						hr.tbl_valorisierung_instanz
					WHERE
						ausgewaehlt
						AND valorisierungsdatum = vi.valorisierungsdatum
						AND (oe_kurzbz = vi.oe_kurzbz OR (oe_kurzbz IS NULL AND vi.oe_kurzbz IS NULL))
				)';

		if (isset($valorisierungsdatum))
		{
			$qry .= ' AND vi.valorisierungsdatum = ?';
			$params[] = $valorisierungsdatum;
		}

		if (isset($oe_kurzbz))
		{
			$qry .= ' AND vi.oe_kurzbz = ?';
			$params[] = $oe_kurzbz;
		}

		if (isset($maxValorisierungsdatum))
		{
			$qry .= ' AND vi.valorisierungsdatum::date < ?::date';
			$params[] = $maxValorisierungsdatum;
		}

		$qry .=
			' ORDER BY
				oe_kurzbz DESC NULLS LAST, valorisierungsdatum, valorisierung_kurzbz, valorisierung_instanz_id';

		return $this->execQuery($qry, $params);
	}
}
