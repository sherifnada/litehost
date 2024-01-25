import { SubdomainOwnerModel, SubdomainOwner } from '../../src/models/subdomainOwner.js';
import DbClient from '../../src/models/dbClient.js';


describe('SubdomainOwnerModel', () => {
  let model: SubdomainOwnerModel;
  let dbClient: DbClient;

  beforeEach(() => {
    dbClient = { singleQuery: jest.fn(), getClient: jest.fn(), pool: undefined } as DbClient;
    model = new SubdomainOwnerModel(dbClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test 1: getRowForSubdomain - Success Scenario
  it('should return a SubdomainOwner object for a known subdomain', async () => {
    const mockSubdomainOwner: SubdomainOwner = {
      subdomain: 'example.com',
      id: '1234-uuid',
      owner: 'testOwner',
      created_at: new Date('2021-01-01')
    };
    (dbClient.singleQuery as jest.Mock).mockResolvedValueOnce({ rows: [mockSubdomainOwner] });

    const result = await model.getRowForSubdomain('example.com');
    expect(result).toEqual(mockSubdomainOwner);
    expect(dbClient.singleQuery).toHaveBeenCalledWith('SELECT * FROM subdomain_owner WHERE subdomain = $1', ['example.com']);
  });

  // Test 2: getRowForSubdomain - No Result Scenario
  it('should return null when no subdomain is found', async () => {
    (dbClient.singleQuery as jest.Mock).mockResolvedValueOnce({ rows: [] });

    const result = await model.getRowForSubdomain('nonexistent.com');
    expect(result).toBeNull();
    expect(dbClient.singleQuery).toHaveBeenCalledWith('SELECT * FROM subdomain_owner WHERE subdomain = $1', ['nonexistent.com']);
  });

  // Test 3: getRowsForOwner - Success Scenario
  it('should return an array of SubdomainOwner objects for a known owner', async () => {
    const mockSubdomainOwners: SubdomainOwner[] = [
      { subdomain: 'example1.com', id: '1234-uuid', owner: 'knownOwner', created_at: new Date('2021-01-01') },
      { subdomain: 'example2.com', id: '5678-uuid', owner: 'knownOwner', created_at: new Date('2021-01-02') }
    ];
    (dbClient.singleQuery as jest.Mock).mockResolvedValueOnce({ rows: mockSubdomainOwners });

    const result = await model.getRowsForOwner('knownOwner');
    expect(result).toEqual(mockSubdomainOwners);
    expect(dbClient.singleQuery).toHaveBeenCalledWith('SELECT * FROM subdomain_owner WHERE owner = $1', ['knownOwner']);
  });

  // Test 4: getRowsForOwner - Empty Result for Non-Existent Owner
  it('should return an empty array when no owner is found', async () => {
    (dbClient.singleQuery as jest.Mock).mockResolvedValueOnce({ rows: [] });

    const result = await model.getRowsForOwner('nonexistentOwner');
    expect(result).toEqual([]);
    expect(dbClient.singleQuery).toHaveBeenCalledWith('SELECT * FROM subdomain_owner WHERE owner = $1', ['nonexistentOwner']);
  });

  // Test 5: SQL Query Format and Prepared Statements
  it('should use correctly formatted SQL queries and prepared statements', async () => {
    (dbClient.singleQuery as jest.Mock).mockResolvedValue({ rows: [] });

    await model.getRowForSubdomain('testSubdomain');
    expect(dbClient.singleQuery).toHaveBeenCalledWith('SELECT * FROM subdomain_owner WHERE subdomain = $1', ['testSubdomain']);

    await model.getRowsForOwner('testOwner');
    expect(dbClient.singleQuery).toHaveBeenCalledWith('SELECT * FROM subdomain_owner WHERE owner = $1', ['testOwner']);
  });


  // Test for subdomainAlreadyInUse
  it('should return true if subdomain is already in use', async () => {
    // Mock getRowForSubdomain to return a non-null value
    const mockSubdomainOwner: SubdomainOwner = {
      subdomain: 'example.com',
      id: '1234-uuid',
      owner: 'testOwner',
      created_at: new Date('2021-01-01')
    };
    (dbClient.singleQuery as jest.Mock).mockResolvedValue({ rows: [mockSubdomainOwner] });

    
    const result = await model.subdomainAlreadyInUse('example.com');
    expect(result).toBe(true);
    expect(dbClient.singleQuery).toHaveBeenCalledWith('SELECT * FROM subdomain_owner WHERE subdomain = $1', ['example.com']);
  });

  it('should return false if subdomain is not in use', async () => {
    (dbClient.singleQuery as jest.Mock).mockResolvedValue({ rows: [] });
    
    const result = await model.subdomainAlreadyInUse('example.com');
    expect(result).toBe(false);
    expect(dbClient.singleQuery).toHaveBeenCalledWith('SELECT * FROM subdomain_owner WHERE subdomain = $1', ['example.com']);
  });

  // Test for associateSubdomainWithOwner
  it('should associate a subdomain with an owner', async () => {
    // Mock singleQuery to return a mock result
    const subdomain = 'example.com';
    const owner = 'sherif';

    dbClient.singleQuery = jest.fn().mockResolvedValue({ rows: []});
    await model.associateSubdomainWithOwner(subdomain, owner);
    expect(dbClient.singleQuery).toHaveBeenCalledWith('INSERT INTO subdomain_owner(subdomain, owner) VALUES($1, $2)', [subdomain, owner]);
  });
});
