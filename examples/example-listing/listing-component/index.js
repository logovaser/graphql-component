
const GraphQLComponent = require('../../../lib/index');
const Property = require('../property-component');
const Reviews = require('../reviews-component');

class ListingComponent extends GraphQLComponent {
  constructor({ useFixtures }) {
    const types = `
      # A listing
      type Listing {
        id: ID!
        propertyId: ID!
        geo: [String]
        reviews: [Review]
      }
      type Query {
        # Listing by id
        listing(id: ID!) : Listing @memoize
      }
    `;

    const resolvers = {
      Query: {
        async listing(_, { id }, context) {
          const [property, reviews] = await Promise.all([
            this.bindings.get(Property).query.property({ id }, `{ id, geo }`, { context }),
            this.bindings.get(Reviews).query.reviewsByPropertyId({ propertyId: id }, `{ content }`, { context })
          ]);
          return { id, property, reviews };
        }
      },
      Listing: {
        id(_) {
          return _.id;
        },
        propertyId(_) {
          return _.property.id;
        },
        geo(_) {
          return _.property.geo;
        },
        reviews(_) {
          return _.reviews;
        }
      }
    };

    super ({ 
      types, 
      resolvers, 
      imports: [
        { 
          component: new Property({ useFixtures }), 
          exclude: ['Query.*'] 
        }, 
        { 
          component: new Reviews({ useFixtures }), 
          exclude: ['Query.*']
        } 
      ] 
    });
  }
}

module.exports = ListingComponent;